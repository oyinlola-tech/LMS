import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getFeatured, getRecommended, getCategories, getDepartments, listCourses, getPreview, getCurriculum, getReviews, createReview, getPricing, getDetail, enroll, getAnnouncements, createAnnouncement, getEvents, createEvent, getComments, getCommentReplies, createComment } from '../controllers/course.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/featured', { preHandler: [fastify.optionalAuth] }, getFeatured);

  fastify.get('/recommended', { preHandler: [fastify.authenticate] }, getRecommended);

  fastify.get('/categories', { preHandler: [fastify.optionalAuth] }, getCategories);

  fastify.get('/departments', { preHandler: [fastify.optionalAuth] }, getDepartments);

  fastify.get('/', { preHandler: [fastify.optionalAuth] }, listCourses);

  fastify.get('/:id/preview', { preHandler: [fastify.optionalAuth] }, getPreview);

  fastify.get('/:id/curriculum', { preHandler: [fastify.authenticate] }, getCurriculum);

  fastify.get('/:id/reviews', { preHandler: [fastify.optionalAuth] }, getReviews);

  fastify.post('/:id/reviews', { preHandler: [fastify.authenticate] }, createReview);

  fastify.get('/:id/pricing', { preHandler: [fastify.optionalAuth] }, getPricing);

  fastify.get('/:id', { preHandler: [fastify.optionalAuth] }, getDetail);

  fastify.post('/:id/enroll', { preHandler: [fastify.authenticate] }, enroll);

  fastify.get('/:id/announcements', { preHandler: [fastify.authenticate] }, getAnnouncements);

  fastify.post('/:id/announcements', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createAnnouncement);

  fastify.get('/:id/events', { preHandler: [fastify.authenticate] }, getEvents);

  fastify.post('/:id/events', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createEvent);

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate] }, getComments);

  fastify.get('/:id/comments/:commentId/replies', { preHandler: [fastify.authenticate] }, getCommentReplies);

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate] }, createComment);
}
