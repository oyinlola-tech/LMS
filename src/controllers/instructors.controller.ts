import { FastifyRequest, FastifyReply } from 'fastify';
import { Course, CourseReview, TutorProfile, User } from '../models';
import { ok, error } from '../utils/response.util';
import { UserRole } from '../enums';

export async function getInstructorPublicProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = await User.findByPk((request.params as any).id, {
      attributes: ['id', 'fullName', 'avatarUrl', 'bio', 'role'],
      include: [{ model: TutorProfile }],
    });
    if (!user || user.role !== UserRole.TUTOR) {
      return error(reply, 404, 'NOT_FOUND', 'Instructor not found');
    }

    const courses = await Course.findAll({
      where: { tutorId: user.id, isPublished: true },
      attributes: ['id', 'title', 'thumbnailUrl', 'difficulty', 'totalHours', 'price', 'currency'],
      order: [['updatedAt', 'DESC']],
      limit: 12,
    });
    const reviewStats = await CourseReview.findAll({
      attributes: [
        [CourseReview.sequelize.fn('AVG', CourseReview.sequelize.col('rating')), 'avgRating'],
        [CourseReview.sequelize.fn('COUNT', CourseReview.sequelize.col('id')), 'reviewCount'],
      ],
      include: [{ model: Course, attributes: [], where: { tutorId: user.id } }],
      raw: true,
    });
    const avgRating = reviewStats.length ? Number((reviewStats[0] as any).avgRating) : 0;
    const reviewCount = reviewStats.length ? Number((reviewStats[0] as any).reviewCount) : 0;

    return ok(reply, {
      profile: {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        headline: (user as any).TutorProfile?.headline || null,
        portfolioUrl: (user as any).TutorProfile?.portfolioUrl || null,
      },
      stats: {
        courseCount: courses.length,
        avgRating: Number.isFinite(avgRating) ? Number(avgRating.toFixed(2)) : 0,
        reviewCount,
      },
      courses,
    }, 'Instructor loaded');
  } catch (err: any) {
    return error(reply, 500, 'INSTRUCTOR_LOAD_FAILED', 'Failed to load instructor');
  }
}
