import { FastifyRequest, FastifyReply } from 'fastify';
import { Portfolio, PortfolioContact, PortfolioPage, PortfolioPlan, PortfolioReview } from '../models';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import {
  savePortfolioCommand,
  savePageCommand, deletePageCommand,
  submitContactCommand,
  saveDomainCommand, verifyDomainCommand,
} from '../services/portfolio/commands';
import {
  getPublicPortfolioQuery,
  getMyPortfolioQuery,
  listThemesQuery,
  listPlansQuery,
  getPortfolioCoursesQuery,
  listContactsQuery,
} from '../services/portfolio/queries';
import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export async function listPages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const portfolio = await Portfolio.findOne({ where: { UserId: request.user!.sub } });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'No portfolio');
    const pages = await PortfolioPage.findAll({ where: { PortfolioId: portfolio.id }, order: [['order', 'ASC']] });
    return ok(reply, pages, 'Pages loaded');
  } catch { return error(reply, 500, 'PAGES_FAILED', 'Failed'); }
}

export async function getPublicPortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, userId } = request.query as { slug?: string; userId?: string };
    if (!slug && !userId) return error(reply, 400, 'VALIDATION', 'Provide slug or userId');
    const result = await getPublicPortfolioQuery.execute(slug, userId);
    if (!result) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
    return ok(reply, result, 'Portfolio loaded');
  } catch (err) {
    request.log.error(err, 'PUBLIC_PORTFOLIO_FAILED');
    return error(reply, 500, 'PORTFOLIO_FAILED', 'Failed to load portfolio');
  }
}

export async function getPortfolioCourses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.params as any).userId || request.user!.sub;
    const courses = await getPortfolioCoursesQuery.execute(userId);
    return ok(reply, courses, 'Courses loaded');
  } catch (err) {
    request.log.error(err, 'PORTFOLIO_COURSES_FAILED');
    return error(reply, 500, 'PORTFOLIO_COURSES_FAILED', 'Failed to load courses');
  }
}

export async function getMyPortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await getMyPortfolioQuery.execute(request.user!.sub);
    return ok(reply, result, 'Portfolio loaded');
  } catch (err) {
    request.log.error(err, 'MY_PORTFOLIO_FAILED');
    return error(reply, 500, 'PORTFOLIO_FAILED', 'Failed to load portfolio');
  }
}

export async function savePortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body || {}) as any;
    const portfolio = await savePortfolioCommand.execute({ userId: request.user!.sub, ...body });
    return portfolio.slug ? created(reply, portfolio, 'Portfolio created') : ok(reply, portfolio, 'Portfolio updated');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'PORTFOLIO_SAVE_FAILED', err.message || 'Failed to save portfolio');
  }
}

export async function listThemes(request: FastifyRequest, reply: FastifyReply) {
  try {
    const themes = await listThemesQuery.execute();
    return ok(reply, themes, 'Themes loaded');
  } catch { return error(reply, 500, 'THEMES_FAILED', 'Failed to load themes'); }
}

export async function listPlans(request: FastifyRequest, reply: FastifyReply) {
  try {
    const isAdmin = request.user && request.user!.role && (request.user!.role === UserRole.ADMIN || request.user!.role === UserRole.SUPER_ADMIN);
    const plans = await listPlansQuery.execute(!!isAdmin);
    return ok(reply, plans, 'Plans loaded');
  } catch { return error(reply, 500, 'PLANS_FAILED', 'Failed to load plans'); }
}

export async function savePage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body || {}) as any;
    const { id } = request.params as { id?: string };
    const page = await savePageCommand.execute({ userId: request.user!.sub, pageId: id, ...body });
    return id ? ok(reply, page, 'Page updated') : created(reply, page, 'Page created');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'PAGE_FAILED', err.message || 'Failed to save page');
  }
}

export async function deletePage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    await deletePageCommand.execute(request.user!.sub, id);
    return ok(reply, null, 'Page deleted');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'PAGE_DELETE_FAILED', err.message || 'Failed');
  }
}

export async function submitContact(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, name, email, message } = (request.body || {}) as any;
    if (!slug || !name || !email || !message) return error(reply, 400, 'VALIDATION', 'slug, name, email, message required');
    const contact = await submitContactCommand.execute({ slug, name, email, message });
    return created(reply, contact, 'Message sent');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'CONTACT_FAILED', err.message || 'Failed');
  }
}

export async function listContacts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const contacts = await listContactsQuery.execute(request.user!.sub);
    return ok(reply, contacts, 'Contacts loaded');
  } catch { return error(reply, 500, 'CONTACTS_FAILED', 'Failed'); }
}

export async function markContactRead(request: FastifyRequest, reply: FastifyReply) {
  try {
    const portfolio = await Portfolio.findOne({ where: { UserId: request.user!.sub } });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'No portfolio');
    const { id } = request.params as { id: string };
    await PortfolioContact.update({ read: true }, { where: { id, PortfolioId: portfolio.id } });
    return ok(reply, null, 'Contact marked read');
  } catch { return error(reply, 500, 'CONTACT_FAILED', 'Failed'); }
}

export async function saveDomain(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { domain } = (request.body || {}) as any;
    if (!domain) return error(reply, 400, 'VALIDATION', 'domain required');
    const result = await saveDomainCommand.execute(request.user!.sub, domain);
    return ok(reply, result, 'Domain saved');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'DOMAIN_FAILED', err.message || 'Failed');
  }
}

export async function verifyDomain(request: FastifyRequest, reply: FastifyReply) {
  try {
    const pd = await verifyDomainCommand.execute(request.user!.sub);
    return ok(reply, { domain: pd.domain, verified: true }, 'Domain verified');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'VERIFY_FAILED', err.message || 'Failed');
  }
}

export async function exportCV(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, userId } = request.query as { slug?: string; userId?: string };
    const result = await getPublicPortfolioQuery.execute(slug, userId || (request.user ? request.user.sub : undefined));
    if (!result || !result.portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
    const p = result.portfolio as any;
    const user = p.User || {};

    const skills = p.skills ? (typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills) : [];
    const certs = p.certifications ? (typeof p.certifications === 'string' ? JSON.parse(p.certifications) : p.certifications) : [];
    const exp = p.experience ? (typeof p.experience === 'string' ? JSON.parse(p.experience) : p.experience) : [];
    const edu = p.education ? (typeof p.education === 'string' ? JSON.parse(p.education) : p.education) : [];
    const links = p.socialLinks ? (typeof p.socialLinks === 'string' ? JSON.parse(p.socialLinks) : p.socialLinks) : {};

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="${(user.fullName || 'portfolio').replace(/\s+/g, '_')}_CV.pdf"`);
    doc.pipe(reply.raw);

    const primary = '#1a56db', secondary = '#374151';
    doc.fontSize(28).font('Helvetica-Bold').fillColor(primary).text(user.fullName || 'Your Name');
    doc.fontSize(11).font('Helvetica').fillColor(secondary).text(p.headline || '');
    doc.moveDown(0.5);
    const linkText = [links.github, links.linkedin, links.website].filter(Boolean).join('  |  ');
    if (linkText) doc.fontSize(9).fillColor('#6b7280').text(linkText);
    if (user.email) doc.fontSize(9).fillColor('#6b7280').text(user.email);
    doc.moveDown(1).moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke().moveDown(0.5);
    if (p.bio) doc.fontSize(10).font('Helvetica').fillColor(secondary).text(p.bio).moveDown(0.5);
    if (skills.length) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor(primary).text('Skills').moveDown(0.3);
      doc.fontSize(10).font('Helvetica').fillColor(secondary).text(skills.join('  |  ')).moveDown(0.8);
    }
    if (exp.length) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor(primary).text('Experience').moveDown(0.3);
      exp.forEach((e: any) => {
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor(secondary).text(e.role || '');
        if (e.company || e.duration) doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text([e.company, e.duration].filter(Boolean).join(' | '));
        if (e.description) doc.fontSize(9.5).font('Helvetica').fillColor(secondary).text(e.description);
        doc.moveDown(0.4);
      });
    }
    if (edu.length) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor(primary).text('Education').moveDown(0.3);
      edu.forEach((e: any) => {
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor(secondary).text(e.degree || '');
        if (e.school || e.graduationYear) doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text([e.school, e.graduationYear].filter(Boolean).join(' | '));
        doc.moveDown(0.3);
      });
    }
    if (certs.length) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor(primary).text('Certifications').moveDown(0.3);
      certs.forEach((c: any) => {
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor(secondary).text(c.name || '');
        if (c.issuer || c.year) doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text([c.issuer, c.year].filter(Boolean).join(' | '));
        doc.moveDown(0.3);
      });
    }
    doc.end();
  } catch (err) {
    request.log.error(err, 'CV_EXPORT_FAILED');
    return error(reply, 500, 'CV_FAILED', 'Failed to export CV');
  }
}

export async function adminSavePlan(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id?: string };
    const { name, slug, price, currency, features, isActive } = (request.body || {}) as any;
    if (id) {
      const plan = await PortfolioPlan.findByPk(id);
      if (!plan) return error(reply, 404, 'NOT_FOUND', 'Plan not found');
      if (name !== undefined) plan.name = name;
      if (slug !== undefined) plan.slug = slug;
      if (price !== undefined) plan.price = price;
      if (currency !== undefined) plan.currency = currency;
      if (features !== undefined) plan.features = features;
      if (isActive !== undefined) plan.isActive = isActive;
      await plan.save();
      return ok(reply, plan, 'Plan updated');
    }
    if (!name || !slug) return error(reply, 400, 'VALIDATION', 'name and slug required');
    const plan = await PortfolioPlan.create({ name, slug, price: price || 0, currency: currency || 'USD', features: features || null });
    return created(reply, plan, 'Plan created');
  } catch { return error(reply, 500, 'PLAN_FAILED', 'Failed to save plan'); }
}

export async function uploadPortfolioImage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await request.file();
    if (!data) return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
    const { file: stream, filename: originalname, mimetype } = data;
    if (!mimetype.startsWith('image/')) return error(reply, 400, 'VALIDATION_ERROR', 'Only images allowed');
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const maxBytes = (Number(process.env.UPLOAD_MAX_MB) || 5) * 1024 * 1024;
    const portfolioPath = path.resolve(uploadDir, 'portfolio');
    fs.mkdirSync(portfolioPath, { recursive: true });
    const unique = Date.now() + '-' + crypto.randomUUID();
    const safe = originalname.replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = unique + '-' + safe;
    const filePath = path.join(portfolioPath, filename);
    const writeStream = fs.createWriteStream(filePath);
    let fileSize = 0;
    stream.on('data', (chunk: Buffer) => { fileSize += chunk.length; });
    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('end', resolve);
      stream.on('error', reject);
      writeStream.on('error', reject);
    });
    if (fileSize > maxBytes) { fs.unlinkSync(filePath); return error(reply, 400, 'VALIDATION_ERROR', 'File too large'); }
    const publicBaseUrl = process.env.PUBLIC_BASE_URL;
    const url = publicBaseUrl ? `${publicBaseUrl}/uploads/portfolio/${filename}` : `/uploads/portfolio/${filename}`;
    return ok(reply, { url }, 'Image uploaded');
  } catch { return error(reply, 500, 'UPLOAD_FAILED', 'Failed to upload image'); }
}

export async function submitReview(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, reviewerName, reviewerEmail, reviewerAvatar, rating, title, content } = (request.body || {}) as any;
    if (!slug || !reviewerName || !rating) return error(reply, 400, 'VALIDATION', 'slug, reviewerName, rating required');
    const portfolio = await Portfolio.findOne({ where: { slug, isPublic: true } });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
    const review = await PortfolioReview.create({
      PortfolioId: portfolio.id, reviewerName, reviewerEmail: reviewerEmail || null,
      reviewerAvatar: reviewerAvatar || null,
      rating: Math.min(5, Math.max(1, Number(rating))), title: title || null, content: content || null,
      isApproved: false,
    });
    return created(reply, review, 'Review submitted for approval');
  } catch { return error(reply, 500, 'REVIEW_FAILED', 'Failed to submit review'); }
}

export async function listReviews(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, userId, page, limit: limitStr, minRating, sort } = request.query as Record<string, string>;
    const where: any = { isApproved: true };
    if (slug) {
      const portfolio = await Portfolio.findOne({ where: { slug } });
      if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
      where.PortfolioId = portfolio.id;
    } else if (userId) {
      const portfolio = await Portfolio.findOne({ where: { UserId: userId } });
      if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
      where.PortfolioId = portfolio.id;
    } else if (request.user) {
      const portfolio = await Portfolio.findOne({ where: { UserId: request.user.sub } });
      if (!portfolio) return ok(reply, { reviews: [], total: 0, page: 1, pages: 0 });
      where.PortfolioId = portfolio.id;
    }
    if (minRating) where.rating = { [require('sequelize').Op.gte]: Number(minRating) };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limitStr) || 12));
    const offset = (pageNum - 1) * limitNum;
    const orderArr = (sort === 'oldest' ? [['createdAt', 'ASC']] : sort === 'highest' ? [['rating', 'DESC'], ['createdAt', 'DESC']] : sort === 'lowest' ? [['rating', 'ASC'], ['createdAt', 'DESC']] : [['createdAt', 'DESC']]) as any;

    const { rows: reviews, count: total } = await PortfolioReview.findAndCountAll({ where, order: orderArr, limit: limitNum, offset });
    return ok(reply, { reviews, total, page: pageNum, pages: Math.ceil(total / limitNum) }, 'Reviews loaded');
  } catch { return error(reply, 500, 'REVIEWS_FAILED', 'Failed'); }
}

export async function topReviews(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug, limit: limitStr } = request.query as Record<string, string>;
    if (!slug) return error(reply, 400, 'VALIDATION', 'slug required');
    const portfolio = await Portfolio.findOne({ where: { slug } });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
    const limitNum = Math.min(10, Math.max(1, Number(limitStr) || 3));
    const reviews = await PortfolioReview.findAll({
      where: { PortfolioId: portfolio.id, isApproved: true },
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: limitNum,
    });
    return ok(reply, reviews, 'Top reviews loaded');
  } catch { return error(reply, 500, 'REVIEWS_FAILED', 'Failed'); }
}

export async function deleteReview(request: FastifyRequest, reply: FastifyReply) {
  try {
    const portfolio = await Portfolio.findOne({ where: { UserId: request.user!.sub } });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'No portfolio');
    const { id } = request.params as { id: string };
    await PortfolioReview.destroy({ where: { id, PortfolioId: portfolio.id } });
    return ok(reply, null, 'Review deleted');
  } catch { return error(reply, 500, 'REVIEW_DELETE_FAILED', 'Failed'); }
}
