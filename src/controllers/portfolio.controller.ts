import { FastifyRequest, FastifyReply } from 'fastify';
import { Portfolio, User, Enrollment } from '../models';
import { ok, created, error } from '../utils/response.util';

export async function getPortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const portfolio = await Portfolio.findOne({
      where: { UserId: userId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'bio'] }],
    });
    if (!portfolio) return error(reply, 404, 'NOT_FOUND', 'Portfolio not found');
    if (!portfolio.isPublic && (!request.user || request.user!.sub !== userId)) {
      return error(reply, 403, 'FORBIDDEN', 'This portfolio is private');
    }
    return ok(reply, portfolio, 'Portfolio loaded');
  } catch (err) {
    request.log.error(err, 'PORTFOLIO_LOAD_FAILED');
    return error(reply, 500, 'PORTFOLIO_FAILED', 'Failed to load portfolio');
  }
}

export async function getMyPortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    let portfolio = await Portfolio.findOne({
      where: { UserId: request.user!.sub },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'bio', 'email'] }],
    });
    return ok(reply, portfolio || {}, 'Portfolio loaded');
  } catch (err) {
    request.log.error(err, 'MY_PORTFOLIO_FAILED');
    return error(reply, 500, 'PORTFOLIO_FAILED', 'Failed to load portfolio');
  }
}

export async function savePortfolio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = (request.body || {}) as any;
    const existing = await Portfolio.findOne({ where: { UserId: request.user!.sub } });
    if (existing) {
      await existing.update({
        headline: body.headline ?? existing.headline,
        bio: body.bio ?? existing.bio,
        skills: body.skills ?? existing.skills,
        socialLinks: body.socialLinks ?? existing.socialLinks,
        certifications: body.certifications ?? existing.certifications,
        education: body.education ?? existing.education,
        experience: body.experience ?? existing.experience,
        isPublic: body.isPublic !== undefined ? body.isPublic : existing.isPublic,
      });
      return ok(reply, existing, 'Portfolio updated');
    }
    const portfolio = await Portfolio.create({
      UserId: request.user!.sub,
      headline: body.headline || null,
      bio: body.bio || null,
      skills: body.skills || null,
      socialLinks: body.socialLinks || null,
      certifications: body.certifications || null,
      education: body.education || null,
      experience: body.experience || null,
      isPublic: body.isPublic !== undefined ? body.isPublic : true,
    });
    return created(reply, portfolio, 'Portfolio created');
  } catch (err) {
    request.log.error(err, 'PORTFOLIO_SAVE_FAILED');
    return error(reply, 500, 'PORTFOLIO_SAVE_FAILED', 'Failed to save portfolio');
  }
}

export async function getPortfolioCourses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.params as any).userId || request.user!.sub;
    const enrollments = await Enrollment.findAll({
      where: { UserId: userId, status: 'completed' },
      include: [{ model: require('../models').Course, attributes: ['id', 'title', 'thumbnailUrl', 'category'] }],
      order: [['completedAt', 'DESC']],
      limit: 50,
    });
    return ok(reply, enrollments, 'Courses loaded');
  } catch (err) {
    request.log.error(err, 'PORTFOLIO_COURSES_FAILED');
    return error(reply, 500, 'PORTFOLIO_COURSES_FAILED', 'Failed to load courses');
  }
}
