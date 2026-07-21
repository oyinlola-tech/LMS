import { CourseCertificate, Enrollment, Course, User, Notification } from '../../../models';
import { sendEmail, templates } from '../../mail';
import { buildCertificateHtml } from '../../../utils/certificateRenderer.util';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import puppeteer from 'puppeteer';

const renderCertificatePdf = async (html: string, outputPath: string) => {
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: String(process.env.CERT_PDF_LANDSCAPE || 'true') === 'true',
      printBackground: true,
      margin: { top: '0.2in', right: '0.2in', bottom: '0.2in', left: '0.2in' },
    });
  } finally {
    if (browser) await browser.close();
  }
};

const buildPublicBaseUrl = () => {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;
  if (process.env.BRAND_APP_URL) return process.env.BRAND_APP_URL;
  return `http://localhost:${process.env.PORT || 4000}`;
};

const buildVerificationUrl = (certId: string) => {
  if (process.env.BRAND_APP_URL) return `${process.env.BRAND_APP_URL}/certificates/verify/${certId}/page`;
  if (process.env.PUBLIC_BASE_URL) return `${process.env.PUBLIC_BASE_URL}/certificates/verify/${certId}/page`;
  return `http://localhost:${process.env.PORT || 4000}/certificates/verify/${certId}/page`;
};

const resolveSignature = async (name?: string) => {
  const signatureName = name || process.env.CERT_SIGNATORY_NAME || 'LearnBridge Team';
  const mode = String(process.env.CERT_SIGNATURE_MODE || 'auto').toLowerCase();
  if (mode === 'text') return { signatureName, signatureImageUrl: '' };
  const { buildSignaturePngDataUrl, buildSignatureDataUrl } = await import('../../../utils/certificateRenderer.util');
  const generated = await buildSignaturePngDataUrl(signatureName);
  return { signatureName, signatureImageUrl: generated || buildSignatureDataUrl(signatureName) };
};

const buildCertificatePayload = async (enrollment: any, certId: string) => {
  const verificationUrl = buildVerificationUrl(certId);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 240 });
  const instructorName = enrollment.Course.tutor?.fullName || '';
  const { signatureName, signatureImageUrl } = await resolveSignature(instructorName);
  return {
    STUDENT_NAME: enrollment.User.fullName || 'Learner',
    COURSE_TITLE: enrollment.Course.title || '',
    ISSUE_DATE: new Date().toLocaleDateString(),
    CERTIFICATE_ID: certId,
    VERIFICATION_URL: verificationUrl,
    INSTITUTION_NAME: process.env.APP_NAME || 'LearnBridge',
    INSTITUTION_NAME_SHORT: process.env.APP_NAME_SHORT || 'LearnBridge',
    LOGO_URL: process.env.BRAND_LOGO_URL || '',
    INSTRUCTOR_NAME: instructorName,
    COURSE_HOURS: enrollment.Course.totalHours || '',
    GRADE: 'Completed',
    SIGNATURE_NAME: signatureName,
    SIGNATURE_TITLE: process.env.CERT_SIGNATORY_TITLE || 'Program Director',
    SIGNATURE_IMAGE_URL: signatureImageUrl,
    ACCREDITATION_LABEL: process.env.CERT_ACCREDITATION_LABEL || 'LearnBridge Verified',
    SEAL_LABEL: process.env.CERT_SEAL_LABEL || 'Official Seal',
    WATERMARK_URL: process.env.CERT_WATERMARK_URL || '',
    SEAL_LOGO_URL: process.env.CERT_SEAL_LOGO_URL || '',
    QR_CODE_URL: qrDataUrl,
  };
};

export class IssueCertificateCommand {
  async execute(userId: string, userEmail: string, courseId: string, certificateUrl?: string): Promise<CourseCertificate> {
    if (!courseId) {
      const err: any = new Error('courseId is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    const enrollment = await Enrollment.findOne({
      where: { UserId: userId, CourseId: courseId },
      include: [
        { model: Course, attributes: ['id', 'title', 'totalHours'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] },
        { model: User, attributes: ['id', 'fullName', 'email'] },
      ],
    });
    if (!enrollment || enrollment.status !== 'completed') {
      const err: any = new Error('Course not completed');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const existing = await CourseCertificate.findOne({ where: { UserId: userId, CourseId: courseId } });
    if (existing) return existing;

    let finalUrl = certificateUrl;
    const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
    const certId = crypto.randomUUID();
    if (!finalUrl) {
      const certificateDir = path.join(uploadsDir, 'certificates');
      fs.mkdirSync(certificateDir, { recursive: true });
      const outputPath = path.join(certificateDir, `${certId}.pdf`);
      const payload = await buildCertificatePayload(enrollment, certId);
      const html = buildCertificateHtml(payload);
      await renderCertificatePdf(html, outputPath);
      finalUrl = publicBaseUrl ? `${publicBaseUrl}/uploads/certificates/${certId}.pdf` : outputPath;
    }

    const cert = await CourseCertificate.create({
      id: certId,
      UserId: userId,
      CourseId: courseId,
      certificateUrl: finalUrl,
    });

    await Notification.create({
      UserId: userId,
      type: 'system',
      title: 'Certificate issued',
      message: 'Your course certificate is ready.',
      data: { courseId, certificateUrl: finalUrl },
    });

    const emailPayload = templates.certificateIssued({
      certificateUrl: finalUrl,
      courseTitle: (enrollment as any).Course.title,
      instructorName: (enrollment as any).Course.tutor?.fullName,
    });
    await sendEmail({ to: (enrollment as any).User.email || userEmail, ...emailPayload });

    return cert;
  }
}
export const issueCertificateCommand = new IssueCertificateCommand();
