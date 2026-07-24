import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  getAnalytics,
  getCourses,
  getCourseStats,
  getActivity,
  getReviews,
  createSupportTicket,
} from '../controllers/instructor.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/analytics', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getAnalytics);

  fastify.get('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getCourses);

  fastify.get('/courses/stats', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getCourseStats);

  fastify.get('/activity', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getActivity);

  fastify.get('/reviews', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getReviews);

  fastify.post('/support', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createSupportTicket);
}