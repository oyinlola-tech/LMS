import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getEarnings, getCourseAnalytics, requestPayout, getPayoutHistory } from '../controllers/tutorFinancials.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/earnings', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getEarnings);

  fastify.get('/courses/analytics', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getCourseAnalytics);

  fastify.post('/payouts/request', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, requestPayout);

  fastify.get('/payouts/history', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getPayoutHistory);
}
