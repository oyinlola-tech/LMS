import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  getAnalytics,
  getCourses,
  getCourseStats,
  getActivity,
  getReviews,
  createSupportTicket,
  listMentors,
} from '../controllers/instructor.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listMentors);

  fastify.get('/analytics', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAnalytics);

  fastify.get('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourses);

  fastify.get('/courses/stats', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourseStats);

  fastify.get('/activity', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getActivity);

  fastify.get('/reviews', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getReviews);

  fastify.post('/support', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createSupportTicket);
}