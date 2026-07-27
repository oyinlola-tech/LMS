import { FastifyRequest, FastifyReply } from 'fastify';
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

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const safeUrl = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw, buildPublicBaseUrl());
    if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
};

const buildCertificateAssetUrls = (cert: any) => {
  const baseUrl = buildPublicBaseUrl();
  const verificationUrl = buildVerificationUrl(cert.id);
  const pngUrl = `${baseUrl}/certificates/export/${cert.id}?format=png`;
  const pdfUrl = `${baseUrl}/certificates/download/${cert.id}`;
  const embedUrl = `${baseUrl}/certificates/embed/${cert.id}`;
  const issuedAt = new Date(cert.issuedAt);
  const courseTitle = cert.Course?.title || cert.courseTitle || 'Course Certificate';
  const studentName = cert.User?.fullName || cert.studentName || 'Learner';
  const brand = process.env.APP_NAME || 'LearnBridge';
  const linkedinCertificationUrl = new URL('https://www.linkedin.com/profile/add');
  linkedinCertificationUrl.searchParams.set('startTask', 'CERTIFICATION_NAME');
  linkedinCertificationUrl.searchParams.set('name', courseTitle);
  linkedinCertificationUrl.searchParams.set('organizationName', brand);
  linkedinCertificationUrl.searchParams.set('issueYear', String(issuedAt.getFullYear()));
  linkedinCertificationUrl.searchParams.set('issueMonth', String(issuedAt.getMonth() + 1));
  linkedinCertificationUrl.searchParams.set('certUrl', verificationUrl);
  linkedinCertificationUrl.searchParams.set('certId', cert.id);
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
  const embedCode = `<a href="${verificationUrl}" target="_blank" rel="noopener"><img src="${pngUrl}" alt="${escapeHtml(studentName)} - ${escapeHtml(courseTitle)} certificate" style="max-width:360px;width:100%;height:auto;border:0" /></a>`;
  return { verificationUrl, pngUrl, pdfUrl, embedUrl, linkedinCertificationUrl: linkedinCertificationUrl.toString(), linkedinShareUrl, embedCode };
};

const serializeCertificate = (cert: any) => {
  const issuedAt = new Date(cert.issuedAt);
  const courseTitle = cert.Course?.title || cert.courseTitle || 'Course Certificate';
  const studentName = cert.User?.fullName || cert.studentName || 'Learner';
  return {
    id: cert.id,
    courseId: cert.Course?.id || cert.CourseId,
    userId: cert.User?.id || cert.UserId,
    courseTitle,
    studentName,
    instructorName: cert.Course?.tutor?.fullName || '',
    issuedAt: issuedAt.toISOString(),
    certificateUrl: cert.certificateUrl,
    ...buildCertificateAssetUrls(cert),
  };
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

export const listCertificates = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const certs = await getUserCertificatesQuery.execute(request.user!.sub);
    return ok(reply, certs.map(serializeCertificate), 'Certificates loaded');
  } catch (err: any) {
    return error(reply, 500, 'CERT_LIST_FAILED', 'Failed to load certificates');
  }
};

export const getCourseCertificate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cert = await getCourseCertificateQuery.execute(request.user!.sub, (request.params as any).courseId);
    if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
    return ok(reply, serializeCertificate(cert), 'Certificate loaded');
  } catch (err: any) {
    return error(reply, 500, 'CERT_LOAD_FAILED', 'Failed to load certificate');
  }
};

export const issueCertificate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { courseId, certificateUrl } = (request.body as Record<string, any>) || {};
    const cert = await issueCertificateCommand.execute(request.user!.sub, request.user!.email, courseId, certificateUrl);
    const freshCert = await CourseCertificate.findByPk(cert.id, {
      include: [
        { model: Course, attributes: ['id', 'title', 'totalHours'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] },
        { model: User, attributes: ['id', 'fullName'] },
      ],
    });
    return created(reply, serializeCertificate(freshCert || cert), 'Certificate issued');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'CERTIFICATE_ISSUE_FAILED', err.message || 'Failed to issue certificate');
  }
};

export const verifyCertificate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await verifyCertificateQuery.execute((request.params as any).certId);
    if (!result) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
    return ok(reply, { ...result, ...buildCertificateAssetUrls(result) }, 'Certificate verified');
  } catch (err: any) {
    return error(reply, 500, 'CERT_VERIFY_FAILED', 'Failed to verify certificate');
  }
};

export const verifyCertificatePage = async (request: FastifyRequest, reply: FastifyReply) => {
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
    const logo = safeUrl(process.env.BRAND_LOGO_URL);
    const brand = process.env.APP_NAME || 'LearnBridge';
    const primary = process.env.BRAND_PRIMARY || '#0B5FFF';
    const urls = buildCertificateAssetUrls(cert);
    const courseTitle = (cert as any).Course.title || '-';
    const studentName = (cert as any).User.fullName || '-';
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(brand)} Certificate Verification</title><meta name="description" content="Verified ${escapeHtml(brand)} certificate for ${escapeHtml(studentName)} in ${escapeHtml(courseTitle)}."><meta property="og:title" content="${escapeHtml(courseTitle)} - Verified Certificate"><meta property="og:description" content="Issued to ${escapeHtml(studentName)} by ${escapeHtml(brand)}."><meta property="og:image" content="${escapeHtml(urls.pngUrl)}"><meta property="og:url" content="${escapeHtml(urls.verificationUrl)}"><meta name="twitter:card" content="summary_large_image"><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#eef3ff;color:#0A1E3C}.wrap{max-width:900px;margin:40px auto;background:#fff;padding:32px;border-radius:18px;box-shadow:0 20px 50px rgba(10,30,60,0.16)}.header{display:flex;align-items:center;gap:12px;margin-bottom:16px}.logo{width:40px;height:40px;border-radius:10px;background:#f1f5ff;display:flex;align-items:center;justify-content:center;overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover}.brand{font-weight:700;font-size:18px;color:${escapeHtml(primary)}}.badge{display:inline-block;background:${escapeHtml(primary)};color:#fff;padding:6px 12px;border-radius:999px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase}h1{margin:16px 0 8px}.meta{color:#64748B}.card{margin-top:20px;padding:18px;background:#F8FAFF;border:1px solid #E2E8F0;border-radius:12px}.row{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.row div{min-width:200px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}a.btn{display:inline-block;background:${escapeHtml(primary)};color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600}a.btn.secondary{background:#E2E8F0;color:#0A1E3C}.embed{margin-top:20px;background:#0A1E3C;color:#F8FAFC;padding:12px;border-radius:12px;font-family:Menlo,Consolas,monospace;font-size:12px;overflow:auto}</style></head><body><div class="wrap"><div class="header"><div class="logo">${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(brand)} logo">` : ''}</div><div class="brand">${escapeHtml(brand)}</div></div><span class="badge">Verified</span><h1>Certificate Verified</h1><p class="meta">This certificate is valid and issued by ${escapeHtml(brand)}.</p><div class="card"><div class="row"><div><strong>Student</strong><br>${escapeHtml(studentName)}</div><div><strong>Course</strong><br>${escapeHtml(courseTitle)}</div><div><strong>Issued</strong><br>${escapeHtml(new Date(cert.issuedAt).toLocaleDateString())}</div><div><strong>Certificate ID</strong><br>${escapeHtml(cert.id)}</div></div></div><div class="actions"><a class="btn" href="${escapeHtml(urls.pdfUrl)}" target="_blank" rel="noopener">Download PDF</a><a class="btn secondary" href="${escapeHtml(urls.pngUrl)}" target="_blank" rel="noopener">Download PNG</a><a class="btn secondary" href="${escapeHtml(urls.linkedinCertificationUrl)}" target="_blank" rel="noopener">Add to LinkedIn</a></div><h2>Portfolio embed</h2><div class="embed">${escapeHtml(urls.embedCode)}</div></div></body></html>`;
    reply.header('Content-Type', 'text/html');
    return reply.send(html);
  } catch (err: any) {
    return error(reply, 500, 'CERT_VERIFY_FAILED', 'Failed to verify certificate');
  }
};

export const getCertificateEmbed = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cert = await CourseCertificate.findByPk((request.params as any).certId, {
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: User, attributes: ['id', 'fullName'] },
      ],
    });
    if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
    const urls = buildCertificateAssetUrls(cert);
    const brand = process.env.APP_NAME || 'LearnBridge';
    const courseTitle = (cert as any).Course.title || 'Course Certificate';
    const studentName = (cert as any).User.fullName || 'Learner';
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(courseTitle)} Credential</title><style>body{margin:0;font-family:Inter,Arial,sans-serif;background:transparent}.credential{display:block;max-width:360px;padding:16px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#0f172a;text-decoration:none;box-shadow:0 10px 30px rgba(15,23,42,.12)}.top{display:flex;align-items:center;gap:10px}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:8px;background:#0B5FFF;color:#fff;font-weight:900}.small{font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em}h1{margin:12px 0 4px;font-size:18px;line-height:1.2}.meta{color:#475569;font-size:13px}.verified{margin-top:12px;color:#065f46;font-size:12px;font-weight:800}</style></head><body><a class="credential" href="${escapeHtml(urls.verificationUrl)}" target="_blank" rel="noopener"><div class="top"><div class="mark">LB</div><div><div class="small">${escapeHtml(brand)} Verified</div><div class="meta">Certificate ID ${escapeHtml(cert.id)}</div></div></div><h1>${escapeHtml(courseTitle)}</h1><div class="meta">Issued to ${escapeHtml(studentName)} on ${escapeHtml(new Date(cert.issuedAt).toLocaleDateString())}</div><div class="verified">Verified credential</div></a></body></html>`;
    reply.header('Content-Type', 'text/html');
    return reply.send(html);
  } catch {
    return error(reply, 500, 'CERT_EMBED_FAILED', 'Failed to render certificate embed');
  }
};

export const downloadCertificate = async (request: FastifyRequest, reply: FastifyReply) => {
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
};

export const getBadge = (request: FastifyRequest, reply: FastifyReply) => {
  const badgePath = path.join(__dirname, '..', 'templates', 'certificates', 'badge.svg');
  reply.header('Content-Type', 'image/svg+xml');
  return reply.sendFile(path.resolve(badgePath));
};

export const getBadgePage = (request: FastifyRequest, reply: FastifyReply) => {
  const baseUrl = buildPublicBaseUrl();
  const badgeUrl = `${baseUrl}/certificates/badge.png`;
  const brand = process.env.APP_NAME || 'LearnBridge';
  const primary = process.env.BRAND_PRIMARY || '#0B5FFF';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brand} Verified Badge</title><meta property="og:title" content="${brand} Verified Certificate Badge"><meta property="og:description" content="Share your verified ${brand} certificate badge on LinkedIn or social media."><meta property="og:image" content="${badgeUrl}"><meta property="og:url" content="${baseUrl}/certificates/badge/page"><meta name="twitter:card" content="summary_large_image"><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#F3F6FF;color:#0A1E3C}.wrap{max-width:980px;margin:48px auto;padding:28px;background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(10,30,60,0.12)}.hero{display:flex;gap:32px;align-items:center;flex-wrap:wrap}.badge{max-width:520px;width:100%;border-radius:16px;background:#F5F7FF;padding:12px}h1{margin:0 0 12px;font-size:32px}p{color:#475569;margin:0 0 16px}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px}.pill{background:${primary};color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}a.btn{display:inline-block;padding:10px 16px;background:${primary};color:#fff;text-decoration:none;border-radius:10px;font-weight:600}a.btn.secondary{background:#E2E8F0;color:#0A1E3C}.code{background:#0A1E3C;color:#F8FAFC;padding:12px;border-radius:12px;font-family:"SF Mono",Menlo,monospace;font-size:12px;overflow:auto}</style></head><body><div class="wrap"><div class="hero"><div><h1>${brand} Verified Badge</h1><p>Showcase your verified ${brand} certificate on LinkedIn, portfolio sites, and social profiles.</p><div class="meta"><span class="pill">Shareable</span><span class="pill">Official</span></div><div class="actions"><a class="btn" href="${badgeUrl}" target="_blank" rel="noopener">Download PNG</a><a class="btn secondary" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/certificates/badge/page`)}" target="_blank" rel="noopener">Share on LinkedIn</a></div></div><div class="badge"><img src="${badgeUrl}" alt="${brand} Verified Badge" style="width:100%;height:auto;display:block"></div></div><h2 style="margin-top:24px">Embed Code</h2><div class="code">&lt;a href="${baseUrl}/certificates/badge/page" target="_blank" rel="noopener"&gt;&lt;img src="${badgeUrl}" alt="${brand} Verified Badge" style="max-width:320px;height:auto"&gt;&lt;/a&gt;</div></div></body></html>`;
  reply.header('Content-Type', 'text/html');
  return reply.send(html);
};

export const getBadgePng = async (request: FastifyRequest, reply: FastifyReply) => {
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
};

export const exportCertificate = async (request: FastifyRequest, reply: FastifyReply) => {
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
};

export const getCertificateQr = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cert = await CourseCertificate.findByPk((request.params as any).certId, {
      include: [{ model: Course, attributes: ['id', 'title'] }, { model: User, attributes: ['id', 'fullName'] }],
    });
    if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
    const verificationUrl = buildVerificationUrl(cert.id);
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 240 });
    reply.header('Content-Type', 'image/png');
    const base64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    return reply.send(Buffer.from(base64, 'base64'));
  } catch (err: any) {
    return error(reply, 500, 'CERT_QR_FAILED', 'Failed to render QR code');
  }
};

export const getCertificateShare = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cert = await CourseCertificate.findByPk((request.params as any).certId, {
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: User, attributes: ['id', 'fullName'] },
      ],
    });
    if (!cert) return error(reply, 404, 'NOT_FOUND', 'Certificate not found');
    const urls = buildCertificateAssetUrls(cert);
    const brand = process.env.APP_NAME || 'LearnBridge';
    const courseTitle = (cert as any).Course.title || 'Course Certificate';
    const studentName = (cert as any).User.fullName || 'Learner';
    const issuedAt = new Date(cert.issuedAt);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(courseTitle)} — ${escapeHtml(studentName)}</title><meta property="og:title" content="${escapeHtml(courseTitle)} — Verified Certificate"><meta property="og:description" content="Verified certificate issued to ${escapeHtml(studentName)} by ${escapeHtml(brand)}."><meta property="og:image" content="${escapeHtml(urls.pngUrl)}"><meta property="og:url" content="${escapeHtml(urls.verificationUrl)}"><meta name="twitter:card" content="summary_large_image"><style>body{margin:0;font-family:"Inter",Arial,sans-serif;background:#eef3ff;color:#0A1E3C}.wrap{max-width:720px;margin:40px auto;background:#fff;padding:2rem;border-radius:18px;box-shadow:0 20px 50px rgba(10,30,60,0.16);text-align:center}.brand{font-weight:700;font-size:14px;color:var(--primary);margin-bottom:1rem}.badge{display:inline-block;background:#065f46;color:#fff;padding:4px 12px;border-radius:999px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase}h1{margin:1rem 0}.actions{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0}.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.25rem;border-radius:10px;font-weight:600;font-size:0.875rem;text-decoration:none;transition:all 0.2s}.btn-primary{background:#0B5FFF;color:#fff}.btn-primary:hover{background:#0040d4}.btn-secondary{background:#E2E8F0;color:#0A1E3C}.btn-secondary:hover{background:#cbd5e1}.btn-outline{border:1.5px solid #0B5FFF;color:#0B5FFF;background:transparent}.btn-outline:hover{background:#EFF6FF}.embed-box{background:#0A1E3C;color:#F8FAFC;padding:1rem;border-radius:10px;font-family:Menlo,Consolas,monospace;font-size:11px;text-align:left;overflow-x:auto;margin-top:1rem}.label{font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem}.qr{margin:1.5rem auto}.qr img{border-radius:12px;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.1)}</style></head><body><div class="wrap"><div class="brand">${escapeHtml(brand)}</div><span class="badge">Verified Certificate</span><h1>${escapeHtml(courseTitle)}</h1><p style="color:#475569;margin-bottom:0.5rem">Issued to <strong>${escapeHtml(studentName)}</strong></p><p style="color:#94a3b8;font-size:0.875rem">${escapeHtml(issuedAt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))}</p><div class="actions"><a class="btn btn-primary" href="${escapeHtml(urls.linkedinCertificationUrl)}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> Add to LinkedIn</a><a class="btn btn-secondary" href="${escapeHtml(urls.linkedinShareUrl)}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> Share on LinkedIn</a><a class="btn btn-outline" href="${escapeHtml(urls.pngUrl)}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PNG</a><a class="btn btn-outline" href="${escapeHtml(urls.pdfUrl)}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF</a></div><div class="qr"><img src="${escapeHtml(urls.pngUrl)}" alt="Certificate QR Code" width="200" height="200"/></div><div class="label">Verification Link</div><input type="text" readonly value="${escapeHtml(urls.verificationUrl)}" onclick="this.select()" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--outline-variant);border-radius:8px;font-size:0.8rem;background:#f8fafc;color:#0A1E3C;margin-bottom:1rem"/></div><div class="label">Embed Code</div><div class="embed-box">${escapeHtml(urls.embedCode)}</div></div></body></html>`;
    reply.header('Content-Type', 'text/html');
    return reply.send(html);
  } catch (err: any) {
    return error(reply, 500, 'CERT_SHARE_FAILED', 'Failed to render share page');
  }
};
