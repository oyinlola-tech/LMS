import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';
import { getFeaturedCoursesQuery } from '../services/course/queries/getFeaturedCourses.query';
import { getRecommendedCoursesQuery } from '../services/course/queries/getRecommendedCourses.query';
import { getCategoriesQuery } from '../services/course/queries/getCategories.query';
import { getDepartmentsQuery } from '../services/course/queries/getDepartments.query';
import { listCoursesQuery } from '../services/course/queries/listCourses.query';
import { getCoursePreviewQuery } from '../services/course/queries/getCoursePreview.query';
import { getCourseCurriculumQuery } from '../services/course/queries/getCourseCurriculum.query';
import { getCourseReviewsQuery } from '../services/course/queries/getCourseReviews.query';
import { courseReviewRepository } from '../repositories/courseReview.repository';
import { getCoursePricingQuery } from '../services/course/queries/getCoursePricing.query';
import { getCourseDetailQuery } from '../services/course/queries/getCourseDetail.query';
import { getCourseAnnouncementsQuery } from '../services/course/queries/getCourseAnnouncements.query';
import { getCourseEventsQuery } from '../services/course/queries/getCourseEvents.query';
import { getCourseCommentsQuery } from '../services/course/queries/getCourseComments.query';
import { getCommentRepliesQuery } from '../services/course/queries/getCommentReplies.query';
import { enrollInCourseCommand } from '../services/course/commands/enrollInCourse.command';
import { createCourseAnnouncementCommand } from '../services/course/commands/createCourseAnnouncement.command';
import { createCourseEventCommand } from '../services/course/commands/createCourseEvent.command';
import { createCourseCommentCommand } from '../services/course/commands/createCourseComment.command';
import { AppError } from '../errors';
import {
  validateCourseAnnouncement,
  validateCourseEvent,
  validateCourseComment,
} from '../validators/course.validator';
import type { IdParams, ListCoursesQuery, CreateAnnouncementBody, CreateEventBody, CreateCommentBody } from '../types';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/featured', { preHandler: [fastify.optionalAuth] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getFeaturedCoursesQuery.execute();
      return ok(reply, result, 'Featured courses loaded');
    } catch {
      return error(reply, 500, 'FEATURED_FAILED', 'Failed to load featured courses');
    }
  });

  fastify.get('/recommended', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getRecommendedCoursesQuery.execute(request.user!.sub);
      return ok(reply, result, 'Recommended courses loaded');
    } catch {
      return error(reply, 500, 'RECOMMENDED_FAILED', 'Failed to load recommendations');
    }
  });

  fastify.get('/categories', { preHandler: [fastify.optionalAuth] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getCategoriesQuery.execute();
      return ok(reply, result, 'Categories loaded');
    } catch {
      return error(reply, 500, 'CATEGORIES_FAILED', 'Failed to load categories');
    }
  });

  fastify.get('/departments', { preHandler: [fastify.optionalAuth] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getDepartmentsQuery.execute();
      return ok(reply, result, 'Departments loaded');
    } catch {
      return error(reply, 500, 'DEPARTMENTS_FAILED', 'Failed to load departments');
    }
  });

  fastify.get('/', { preHandler: [fastify.optionalAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as ListCoursesQuery;
      const userId = request.user?.sub;
      const result = await listCoursesQuery.execute({ ...query, userId });
      return ok(reply, result, 'Courses loaded');
    } catch {
      return error(reply, 500, 'COURSE_LIST_FAILED', 'Failed to load courses');
    }
  });

  fastify.get('/:id/preview', { preHandler: [fastify.optionalAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCoursePreviewQuery.execute(id);
      return ok(reply, result, 'Course preview loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'COURSE_PREVIEW_FAILED', 'Failed to load preview');
    }
  });

  fastify.get('/:id/curriculum', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCourseCurriculumQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Curriculum loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'CURRICULUM_FAILED', 'Failed to load curriculum');
    }
  });

  fastify.get('/:id/reviews', { preHandler: [fastify.optionalAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCourseReviewsQuery.execute(id);
      return ok(reply, result, 'Reviews loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'REVIEWS_FAILED', 'Failed to load reviews');
    }
  });

  fastify.post('/:id/reviews', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const body = (request.body || {}) as { rating: number; comment?: string; consentToFeature?: boolean };
      if (!body.rating || body.rating < 1 || body.rating > 5) {
        return error(reply, 400, 'VALIDATION_ERROR', 'Rating must be between 1 and 5');
      }
      const existing = await courseReviewRepository.findByCourseId(id);
      const mine = existing.find((r: any) => r.UserId === request.user!.sub);
      if (mine) {
        return error(reply, 409, 'ALREADY_REVIEWED', 'You have already reviewed this course');
      }
      const result = await courseReviewRepository.create({
        CourseId: id,
        UserId: request.user!.sub,
        rating: body.rating,
        comment: body.comment || null,
        consentToFeature: body.consentToFeature || false,
      });
      return created(reply, result, 'Review submitted');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'REVIEW_CREATE_FAILED', 'Failed to submit review');
    }
  });

  fastify.get('/:id/pricing', { preHandler: [fastify.optionalAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCoursePricingQuery.execute(id);
      return ok(reply, result, 'Pricing loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'PRICING_FAILED', 'Failed to load pricing');
    }
  });

  fastify.get('/:id', { preHandler: [fastify.optionalAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const userId = request.user?.sub;
      const result = await getCourseDetailQuery.execute(id, userId);
      return ok(reply, result, 'Course loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'COURSE_DETAIL_FAILED', 'Failed to load course');
    }
  });

  fastify.post('/:id/enroll', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await enrollInCourseCommand.execute(id, request.user!.sub);
      if (result.alreadyEnrolled) {
        return ok(reply, { enrollmentId: result.enrollmentId }, 'Already enrolled');
      }
      return created(reply, { enrollmentId: result.enrollmentId }, 'Enrollment created');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'ENROLL_FAILED', 'Failed to enroll');
    }
  });

  fastify.get('/:id/announcements', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCourseAnnouncementsQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Announcements loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'ANNOUNCEMENTS_FAILED', 'Failed to load announcements');
    }
  });

  fastify.post('/:id/announcements', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateAnnouncementBody;
    const validation = validateCourseAnnouncement(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await createCourseAnnouncementCommand.execute({
        courseId: id,
        createdById: request.user!.sub,
        title: body.title,
        body: body.body,
      });
      return created(reply, result, 'Announcement created');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'ANNOUNCEMENT_CREATE_FAILED', 'Failed to create announcement');
    }
  });

  fastify.get('/:id/events', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getCourseEventsQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Events loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'EVENTS_FAILED', 'Failed to load events');
    }
  });

  fastify.post('/:id/events', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateEventBody;
    const validation = validateCourseEvent(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await createCourseEventCommand.execute({
        courseId: id,
        createdById: request.user!.sub,
        title: body.title,
        description: body.description,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        meetingUrl: body.meetingUrl,
      });
      return created(reply, result, 'Event created');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'EVENT_CREATE_FAILED', 'Failed to create event');
    }
  });

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const { page, limit } = request.query as { page?: string; limit?: string };
      const result = await getCourseCommentsQuery.execute(id, request.user!.sub, request.user!.role, Number(page) || 1, Number(limit) || 10);
      return ok(reply, result, 'Comments loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'COMMENTS_FAILED', 'Failed to load comments');
    }
  });

  fastify.get('/:id/comments/:commentId/replies', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { commentId } = request.params as { commentId: string };
      const { page, limit } = request.query as { page?: string; limit?: string };
      const result = await getCommentRepliesQuery.execute(commentId, Number(page) || 1, Number(limit) || 20);
      return ok(reply, result, 'Replies loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'REPLIES_FAILED', 'Failed to load replies');
    }
  });

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateCommentBody & { parentId?: string };
    const validation = validateCourseComment(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await createCourseCommentCommand.execute({
        courseId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        content: body.content,
        parentId: body.parentId,
      });
      return created(reply, result, 'Comment posted');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      if (err instanceof AppError && err.code === 'FORBIDDEN') {
        return error(reply, 403, err.code, err.message);
      }
      return error(reply, 500, 'COMMENT_CREATE_FAILED', 'Failed to post comment');
    }
  });
}
