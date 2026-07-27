import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getFeatured, getRecommended, getCategories, getDepartments, listCourses, getPreview, getCurriculum, getReviews, createReview, getPricing, getDetail, enroll, getAnnouncements, createAnnouncement, getEvents, createEvent, getComments, getCommentReplies, createComment, getReviewsList } from '../controllers/course.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/featured', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getFeatured);

  fastify.get('/recommended', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getRecommended);

  fastify.get('/categories', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCategories);

  fastify.get('/departments', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getDepartments);

  fastify.get('', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('pages/courses.html');
    return listCourses(request, reply);
  });

  fastify.get('/reviews', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getReviewsList);

  fastify.get('/:id/preview', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPreview);

  fastify.get('/:id/curriculum', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCurriculum);

  fastify.get('/:id/reviews', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getReviews);

  fastify.post('/:id/reviews', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createReview);

  fastify.get('/:id/pricing', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPricing);

  fastify.get('/:id', { preHandler: [fastify.optionalAuth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getDetail);

  fastify.post('/:id/enroll', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, enroll);

  fastify.get('/:id/announcements', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAnnouncements);

  fastify.post('/:id/announcements', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createAnnouncement);

  fastify.get('/:id/events', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getEvents);

  fastify.post('/:id/events', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createEvent);

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getComments);

  fastify.get('/:id/comments/:commentId/replies', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCommentReplies);

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createComment);
}
