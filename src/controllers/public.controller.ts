import { Op } from 'sequelize';
import { FastifyRequest, FastifyReply } from 'fastify';
import { User, BlogPost, TutorProfile, Course, Enrollment, CourseCertificate, UserStreak } from '../models';
import { courseReviewRepository } from '../repositories/courseReview.repository';
import { ok, error } from '../utils/response.util';

const { APP_NAME, APP_NAME_SHORT, SUPPORT_EMAIL, BRAND_APP_URL } = process.env;

export async function getConfig(_request: FastifyRequest, reply: FastifyReply) {
  return ok(reply, {
    appName: APP_NAME || 'LearnBridge',
    appNameShort: APP_NAME_SHORT || 'LearnBridge',
    supportEmail: SUPPORT_EMAIL || '',
    appUrl: BRAND_APP_URL || '',
    defaultAvatarUrl: '/img/placeholder.svg',
    defaultThumbnailUrl: '/img/placeholder.svg',
  }, 'App config loaded');
}

export async function getLanding(_request: FastifyRequest, reply: FastifyReply) {
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
}

export async function getTestimonials(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const reviews = await courseReviewRepository.findFeatured(20);
    return ok(reply, reviews, 'Testimonials loaded');
  } catch (err: any) {
    return error(reply, 500, 'TESTIMONIALS_FAILED', 'Failed to load testimonials');
  }
}

export async function getPublicProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullName', 'avatarUrl', 'bio', 'headline', 'location', 'website', 'createdAt'],
    });
    if (!user) return error(reply, 404, 'NOT_FOUND', 'User not found');

    const [enrollments, streak, courses] = await Promise.all([
      Enrollment.count({ where: { UserId: userId } }),
      UserStreak.findOne({ where: { UserId: userId } }),
      Course.findAll({ where: { tutorId: userId }, attributes: ['id', 'title', 'coverUrl', 'price', 'createdAt'], limit: 6 }),
    ]);

    return ok(reply, {
      user: user.toJSON(),
      stats: { enrollments, streak: streak?.currentStreak || 0, coursesCount: courses.length },
      courses: courses.map(c => c.toJSON()),
    }, 'Profile loaded');
  } catch (err) {
    return error(reply, 500, 'PROFILE_FAILED', 'Failed to load profile');
  }
}
