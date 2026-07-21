import { Op } from 'sequelize';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { User, BlogPost, TutorProfile, Course, Enrollment, CourseCertificate } from '../models';
import { courseReviewRepository } from '../repositories/courseReview.repository';
import { ok, error } from '../utils/response.util';

const { APP_NAME, APP_NAME_SHORT, SUPPORT_EMAIL, BRAND_APP_URL } = process.env;

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/config', async (_request: FastifyRequest, reply: FastifyReply) => {
    return ok(reply, {
      appName: APP_NAME || 'LearnBridge',
      appNameShort: APP_NAME_SHORT || 'LearnBridge',
      supportEmail: SUPPORT_EMAIL || '',
      appUrl: BRAND_APP_URL || '',
      defaultAvatarUrl: '/img/placeholder.svg',
      defaultThumbnailUrl: '/img/placeholder.svg',
    }, 'App config loaded');
  });

  fastify.get('/landing', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const featuredCourses = await Course.findAll({
        where: { isPublished: true },
        include: [{ model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['updatedAt', 'DESC']],
        limit: 6,
      });

      const totalUsers = await User.count({ where: { role: 'learner' } });
      const totalCourses = await Course.count({ where: { isPublished: true } });
      const totalEnrollments = await Enrollment.count();
      const totalCertificates = await CourseCertificate.count();

      const recentBlogPosts = await BlogPost.findAll({
        where: { isPublished: true },
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['publishedAt', 'DESC']],
        limit: 3,
      });

      const topInstructors = await User.findAll({
        where: { role: 'tutor' },
        attributes: ['id', 'fullName', 'avatarUrl', 'bio'],
        include: [{ model: TutorProfile, attributes: ['headline'] }],
        limit: 4,
      });

      const featuredReviews = await courseReviewRepository.findFeatured(10);

      return ok(reply, {
        featuredCourses,
        stats: { totalUsers, totalCourses, totalEnrollments, totalCertificates },
        instructors: topInstructors,
        testimonials: featuredReviews,
        recentBlogPosts,
      }, 'Landing page data loaded');
    } catch (err: any) {
      return error(reply, 500, 'LANDING_FAILED', 'Failed to load landing page data');
    }
  });

  fastify.get('/testimonials', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reviews = await courseReviewRepository.findFeatured(20);
      return ok(reply, reviews, 'Testimonials loaded');
    } catch (err: any) {
      return error(reply, 500, 'TESTIMONIALS_FAILED', 'Failed to load testimonials');
    }
  });
}
