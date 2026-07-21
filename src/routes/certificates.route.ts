import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CourseCertificate, Course, User, Enrollment } from '../models';
import { ok, created, error } from '../utils/response.util';
import { logger } from '../core/loggers';
import { buildCertificateHtml } from '../utils/certificateRenderer.util';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import puppeteer from 'puppeteer';
import { issueCertificateCommand } from '../services/certificates/commands/issueCertificate.command';
import { getUserCertificatesQuery } from '../services/certificates/queries/getUserCertificates.query';
import { getCourseCertificateQuery } from '../services/certificates/queries/getCourseCertificate.query';
import { verifyCertificateQuery } from '../services/certificates/queries/verifyCertificate.query';
import { getCertificateFileQuery } from '../services/certificates/queries/getCertificateFile.query';

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

const renderBadgePng = async (svgPath: string, outputPath: string) => {
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const svg = fs.readFileSync(svgPath, 'utf8');
    await page.setContent(svg, { waitUntil: 'domcontentloaded' });
    const buffer = await page.screenshot({ type: 'png', fullPage: true });
    fs.writeFileSync(outputPath, buffer);
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
  const { buildSignaturePngDataUrl, buildSignatureDataUrl } = await import('../utils/certificateRenderer.util');
  const generated = await buildSignaturePngDataUrl(signatureName);
  return { signatureName, signatureImageUrl: generated || buildSignatureDataUrl(signatureName) };
};

const buildCertificatePayloadFromCertificate = async (cert: any) => {
  const verificationUrl = buildVerificationUrl(cert.id);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 240 });
  const instructorName = cert.Course.tutor?.fullName || '';
  const { signatureName, signatureImageUrl } = await resolveSignature(instructorName);
  const baseUrl = buildPublicBaseUrl();
  return {
    STUDENT_NAME: cert.User.fullName || 'Learner',
    COURSE_TITLE: cert.Course.title || '',
    ISSUE_DATE: new Date(cert.issuedAt).toLocaleDateString(),
    CERTIFICATE_ID: cert.id,
    VERIFICATION_URL: verificationUrl,
    INSTITUTION_NAME: process.env.APP_NAME || 'LearnBridge',
    INSTITUTION_NAME_SHORT: process.env.APP_NAME_SHORT || 'LearnBridge',
    LOGO_URL: process.env.BRAND_LOGO_URL || `${baseUrl}/img/logo.svg`,
    INSTRUCTOR_NAME: instructorName,
    COURSE_HOURS: cert.Course.totalHours || '',
    GRADE: 'Completed',
    SIGNATURE_NAME: signatureName,
    SIGNATURE_TITLE: process.env.CERT_SIGNATORY_TITLE || 'Program Director',
    SIGNATURE_IMAGE_URL: signatureImageUrl,
    ACCREDITATION_LABEL: process.env.CERT_ACCREDITATION_LABEL || 'LearnBridge Verified',
    SEAL_LABEL: process.env.CERT_SEAL_LABEL || 'LearnBridge',
    WATERMARK_URL: process.env.CERT_WATERMARK_URL || '',
    SEAL_LOGO_URL: process.env.CERT_SEAL_LOGO_URL || '',
    QR_CODE_URL: qrDataUrl,
  };
};

const buildCertificatePayload = async (enrollment: any, certId: string) => {
  const verificationUrl = buildVerificationUrl(certId);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 240 });
  const instructorName = enrollment.Course.tutor?.fullName || '';
  const { signatureName, signatureImageUrl } = await resolveSignature(instructorName);
  const baseUrl = buildPublicBaseUrl();
  return {
    STUDENT_NAME: enrollment.User.fullName || 'Learner',
    COURSE_TITLE: enrollment.Course.title || '',
    ISSUE_DATE: new Date().toLocaleDateString(),
    CERTIFICATE_ID: certId,
    VERIFICATION_URL: verificationUrl,
    INSTITUTION_NAME: process.env.APP_NAME || 'LearnBridge',
    INSTITUTION_NAME_SHORT: process.env.APP_NAME_SHORT || 'LearnBridge',
    LOGO_URL: process.env.BRAND_LOGO_URL || `${baseUrl}/img/logo.svg`,
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

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const certs = await getUserCertificatesQuery.execute(request.user!.sub);
      return ok(reply, certs, 'Certificates loaded');
    } catch (err: any) {
      return error(reply, 500, 'CERT_LIST_FAILED', 'Failed to load certificates');
    }
  });

  fastify.get('/:courseId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const cert = await getCourseCertificateQuery.execute(request.user!.sub, (request.params as any).courseId);
      if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
      return ok(reply, cert, 'Certificate loaded');
    } catch (err: any) {
      return error(reply, 500, 'CERT_LOAD_FAILED', 'Failed to load certificate');
    }
  });

  fastify.post('/issue', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { courseId, certificateUrl } = (request.body as Record<string, any>) || {};
      const cert = await issueCertificateCommand.execute(request.user!.sub, request.user!.email, courseId, certificateUrl);
      return created(reply, cert, 'Certificate issued');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'CERTIFICATE_ISSUE_FAILED', err.message || 'Failed to issue certificate');
    }
  });

  if (String(process.env.DEV_EMAIL_PREVIEW) === 'true') {
    fastify.post('/dev-issue', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { courseId, userId } = (request.body as Record<string, any>) || {};
        const targetUserId = userId || request.user!.sub;

        const enrollment = await Enrollment.findOne({
          where: { UserId: targetUserId, CourseId: courseId },
          include: [
            { model: Course, attributes: ['id', 'title', 'totalHours'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] },
            { model: User, attributes: ['id', 'fullName', 'email'] },
          ],
        });
        if (!enrollment) return error(reply, 404, 'NOT_FOUND', 'Enrollment not found');

        const existing = await CourseCertificate.findOne({ where: { UserId: targetUserId, CourseId: courseId } });
        if (existing) return ok(reply, existing, 'Certificate already exists');

        const certId: string = crypto.randomUUID();
        const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
        const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
        const certificateDir = path.join(uploadsDir, 'certificates');
        fs.mkdirSync(certificateDir, { recursive: true });
        const outputPath = path.join(certificateDir, `${certId}.pdf`);

        const payload = await buildCertificatePayload(enrollment, certId);
        const html = buildCertificateHtml(payload);
        await renderCertificatePdf(html, outputPath);

        const finalUrl = publicBaseUrl ? `${publicBaseUrl}/uploads/certificates/${certId}.pdf` : outputPath;

        const cert = await CourseCertificate.create({
          id: certId,
          UserId: targetUserId,
          CourseId: courseId,
          certificateUrl: finalUrl,
        });

        const { sendEmail, templates } = await import('../services/mail');
        const emailPayload = templates.certificateIssued({
          certificateUrl: finalUrl,
          courseTitle: (enrollment as any).Course.title,
          instructorName: (enrollment as any).Course.tutor?.fullName,
        });
        await sendEmail({ to: (enrollment as any).User.email, ...emailPayload });

        return created(reply, {
          ...cert.toJSON(),
          verificationUrl: buildVerificationUrl(certId),
          courseTitle: (enrollment as any).Course.title,
          studentName: (enrollment as any).User.fullName,
        }, 'Certificate issued');
      } catch (err: any) {
        logger.error('[certificates] dev-issue error', err);
        return error(reply, 500, 'CERTIFICATE_ISSUE_FAILED', err.message);
      }
    });
  }

  fastify.get('/verify/:certId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await verifyCertificateQuery.execute((request.params as any).certId);
      if (!result) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
      return ok(reply, result, 'Certificate verified');
    } catch (err: any) {
      return error(reply, 500, 'CERT_VERIFY_FAILED', 'Failed to verify certificate');
    }
  });

  fastify.get('/verify/:certId/page', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const cert = await CourseCertificate.findByPk((request.params as any).certId, {
        include: [
          { model: Course, attributes: ['id', 'title'] },
          { model: User, attributes: ['id', 'fullName'] },
        ],
      });
      if (!cert) {
        reply.status(404).send('<h2>Certificate not found</h2>');
        return;
      }
      const logo = process.env.BRAND_LOGO_URL;
      const brand = process.env.APP_NAME || 'LearnBridge';
      const primary = process.env.BRAND_PRIMARY || '#0B5FFF';
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brand} Certificate Verification</title><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#eef3ff;color:#0A1E3C}.wrap{max-width:860px;margin:40px auto;background:#fff;padding:32px;border-radius:18px;box-shadow:0 20px 50px rgba(10,30,60,0.16)}.header{display:flex;align-items:center;gap:12px;margin-bottom:16px}.logo{width:40px;height:40px;border-radius:10px;background:#f1f5ff;display:flex;align-items:center;justify-content:center;overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover}.brand{font-weight:700;font-size:18px;color:${primary}}.badge{display:inline-block;background:${primary};color:#fff;padding:6px 12px;border-radius:999px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase}h1{margin:16px 0 8px}.meta{color:#64748B}.card{margin-top:20px;padding:18px;background:#F8FAFF;border:1px solid #E2E8F0;border-radius:12px}.row{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.row div{min-width:200px}a.btn{display:inline-block;margin-top:18px;background:${primary};color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600}</style></head><body><div class="wrap"><div class="header"><div class="logo">${logo ? `<img src="${logo}" alt="${brand} logo">` : ''}</div><div class="brand">${brand}</div></div><span class="badge">Verified</span><h1>Certificate Verified</h1><p class="meta">This certificate is valid and issued by ${brand}.</p><div class="card"><div class="row"><div><strong>Student</strong><br>${(cert as any).User.fullName || '-'}</div><div><strong>Course</strong><br>${(cert as any).Course.title || '-'}</div><div><strong>Issued</strong><br>${new Date(cert.issuedAt).toLocaleDateString()}</div><div><strong>Certificate ID</strong><br>${cert.id}</div></div></div><a class="btn" href="${cert.certificateUrl}" target="_blank" rel="noopener">View Certificate PDF</a></div></body></html>`;
      reply.header('Content-Type', 'text/html');
      return reply.send(html);
    } catch (err: any) {
      return error(reply, 500, 'CERT_VERIFY_FAILED', 'Failed to verify certificate');
    }
  });

  fastify.get('/download/:certId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getCertificateFileQuery.execute((request.params as any).certId);
      if (!result) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
      if (result.certificateUrl.startsWith('http://') || result.certificateUrl.startsWith('https://')) {
        return reply.redirect(result.certificateUrl);
      }
      return reply.sendFile(path.resolve(result.certificateUrl));
    } catch (err: any) {
      return error(reply, 500, 'CERT_DOWNLOAD_FAILED', 'Failed to download certificate');
    }
  });

  fastify.get('/badge', (request: FastifyRequest, reply: FastifyReply) => {
    const badgePath = path.join(__dirname, '..', 'templates', 'certificates', 'badge.svg');
    reply.header('Content-Type', 'image/svg+xml');
    return reply.sendFile(path.resolve(badgePath));
  });

  fastify.get('/badge/page', (request: FastifyRequest, reply: FastifyReply) => {
    const baseUrl = buildPublicBaseUrl();
    const badgeUrl = `${baseUrl}/certificates/badge.png`;
    const brand = process.env.APP_NAME || 'LearnBridge';
    const primary = process.env.BRAND_PRIMARY || '#0B5FFF';
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brand} Verified Badge</title><meta property="og:title" content="${brand} Verified Certificate Badge"><meta property="og:description" content="Share your verified ${brand} certificate badge on LinkedIn or social media."><meta property="og:image" content="${badgeUrl}"><meta property="og:url" content="${baseUrl}/certificates/badge/page"><meta name="twitter:card" content="summary_large_image"><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#F3F6FF;color:#0A1E3C}.wrap{max-width:980px;margin:48px auto;padding:28px;background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(10,30,60,0.12)}.hero{display:flex;gap:32px;align-items:center;flex-wrap:wrap}.badge{max-width:520px;width:100%;border-radius:16px;background:#F5F7FF;padding:12px}h1{margin:0 0 12px;font-size:32px}p{color:#475569;margin:0 0 16px}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px}.pill{background:${primary};color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}a.btn{display:inline-block;padding:10px 16px;background:${primary};color:#fff;text-decoration:none;border-radius:10px;font-weight:600}a.btn.secondary{background:#E2E8F0;color:#0A1E3C}.code{background:#0A1E3C;color:#F8FAFC;padding:12px;border-radius:12px;font-family:"SF Mono",Menlo,monospace;font-size:12px;overflow:auto}</style></head><body><div class="wrap"><div class="hero"><div><h1>${brand} Verified Badge</h1><p>Showcase your verified ${brand} certificate on LinkedIn, portfolio sites, and social profiles.</p><div class="meta"><span class="pill">Shareable</span><span class="pill">Official</span></div><div class="actions"><a class="btn" href="${badgeUrl}" target="_blank" rel="noopener">Download PNG</a><a class="btn secondary" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/certificates/badge/page`)}" target="_blank" rel="noopener">Share on LinkedIn</a></div></div><div class="badge"><img src="${badgeUrl}" alt="${brand} Verified Badge" style="width:100%;height:auto;display:block"></div></div><h2 style="margin-top:24px">Embed Code</h2><div class="code">&lt;a href="${baseUrl}/certificates/badge/page" target="_blank" rel="noopener"&gt;&lt;img src="${badgeUrl}" alt="${brand} Verified Badge" style="max-width:320px;height:auto"&gt;&lt;/a&gt;</div></div></body></html>`;
    reply.header('Content-Type', 'text/html');
    return reply.send(html);
  });

  fastify.get('/badge.png', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const cacheDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'certificate-cache');
      fs.mkdirSync(cacheDir, { recursive: true });
      const badgePath = path.join(__dirname, '..', 'templates', 'certificates', 'badge.svg');
      const pngPath = path.join(cacheDir, 'learnbridge-badge.png');
      if (!fs.existsSync(pngPath)) {
        await renderBadgePng(badgePath, pngPath);
      }
      reply.header('Content-Type', 'image/png');
      return reply.sendFile(path.resolve(pngPath));
    } catch (err: any) {
      return error(reply, 500, 'BADGE_RENDER_FAILED', 'Failed to render badge');
    }
  });

  fastify.get('/export/:certId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { format = 'png' } = request.query as any;
      const cert = await CourseCertificate.findByPk((request.params as any).certId, {
        include: [
          { model: Course, attributes: ['id', 'title', 'totalHours'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] },
          { model: User, attributes: ['id', 'fullName'] },
        ],
      });
      if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');

      const cacheEnabled = String(process.env.CERT_CACHE_ENABLED || 'true') === 'true';
      const cacheDir = process.env.CERT_IMAGE_CACHE_DIR
        ? path.resolve(process.env.CERT_IMAGE_CACHE_DIR)
        : path.join(process.env.UPLOAD_DIR || 'uploads', 'certificate-cache');
      fs.mkdirSync(cacheDir, { recursive: true });
      const cachePath = path.join(cacheDir, `${cert.id}.${String(format).toLowerCase()}`);
      if (cacheEnabled && fs.existsSync(cachePath)) {
        return reply.sendFile(path.resolve(cachePath));
      }

      const payload = await buildCertificatePayloadFromCertificate(cert);
      const html = buildCertificateHtml(payload);

      if (String(format).toLowerCase() === 'pdf') {
        reply.header('Content-Type', 'application/pdf');
        await renderCertificatePdf(html, cachePath);
        return reply.sendFile(path.resolve(cachePath));
      }

      let browser;
      let buffer;
      try {
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        buffer = await page.screenshot({ type: 'png', fullPage: true });
      } finally {
        if (browser) await browser.close();
      }
      fs.writeFileSync(cachePath, buffer);
      reply.header('Content-Type', 'image/png');
      return reply.send(buffer);
    } catch (err: any) {
      return error(reply, 500, 'CERT_EXPORT_FAILED', 'Failed to export certificate');
    }
  });

  fastify.get('/preview', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (String(process.env.DEV_CERT_PREVIEW) !== 'true') return error(reply, 403, 'FORBIDDEN', 'Certificate preview disabled');
      const { format = 'pdf', studentName, courseTitle, instructorName, issueDate, grade, courseHours } = request.query as any;
      const certId = crypto.randomUUID();
      const enrollment = {
        User: { fullName: studentName || 'Jane Doe' },
        Course: { title: courseTitle || 'Advanced UI Systems', totalHours: courseHours || 12, tutor: { fullName: instructorName || 'Alex Kim' } },
      } as any;
      const payload = await buildCertificatePayload(enrollment, certId);
      if (issueDate) payload.ISSUE_DATE = issueDate;
      if (grade) payload.GRADE = grade;
      const html = buildCertificateHtml(payload);

      if (String(format).toLowerCase() === 'html') {
        reply.header('Content-Type', 'text/html');
        return reply.send(html);
      }
      reply.header('Content-Type', 'application/pdf');
      const tempPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'certificates', `${certId}-preview.pdf`);
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      await renderCertificatePdf(html, tempPath);
      return reply.sendFile(path.resolve(tempPath));
    } catch (err: any) {
      return error(reply, 500, 'CERT_PREVIEW_FAILED', 'Failed to render preview');
    }
  });

  fastify.get('/preview/gallery', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (String(process.env.DEV_CERT_PREVIEW) !== 'true') return error(reply, 403, 'FORBIDDEN', 'Certificate preview disabled');
      const baseUrl = buildPublicBaseUrl();
      const samples = [
        { studentName: 'Jane Doe', courseTitle: 'Advanced UI Systems', instructorName: 'Alex Kim', grade: 'Completed' },
        { studentName: 'Marcus Thorne', courseTitle: 'Product Strategy 101', instructorName: 'Elena Vance', grade: 'Completed' },
        { studentName: 'Sarah Jenkins', courseTitle: 'Frontend Foundations', instructorName: 'Tariq Bello', grade: 'Completed' },
      ];
      const cards = samples.map((sample, index) => {
        const params = new URLSearchParams({ format: 'pdf', studentName: sample.studentName, courseTitle: sample.courseTitle, instructorName: sample.instructorName, grade: sample.grade, courseHours: String(12 + index * 2) });
        return `<div class="card"><h3>${sample.courseTitle}</h3><p>${sample.studentName} · ${sample.instructorName}</p><iframe src="${baseUrl}/certificates/preview?${params.toString()}" title="Certificate preview"></iframe></div>`;
      }).join('');
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Certificate Preview Gallery</title><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#F3F6FF;color:#0A1E3C}.wrap{max-width:1200px;margin:36px auto;padding:24px}h1{margin-bottom:8px}p{color:#475569;margin-top:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}.card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 20px 40px rgba(10,30,60,0.1)}iframe{width:100%;height:420px;border:none;border-radius:12px;background:#fff}.link{margin-top:18px;display:inline-block;color:#0B5FFF;text-decoration:none;font-weight:600}</style></head><body><div class="wrap"><h1>Certificate Preview Gallery</h1><p>PDF previews for QA. Disable in production by setting DEV_CERT_PREVIEW=false.</p><div class="grid">${cards}</div><a class="link" href="${baseUrl}/certificates/preview?format=html" target="_blank" rel="noopener">Open HTML preview</a></div></body></html>`;
      reply.header('Content-Type', 'text/html');
      return reply.send(html);
    } catch (err: any) {
      return error(reply, 500, 'CERT_PREVIEW_FAILED', 'Failed to render preview gallery');
    }
  });
}
