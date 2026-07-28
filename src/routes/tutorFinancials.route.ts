import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getEarnings, getCourseAnalytics, requestPayout, getPayoutHistory } from '../controllers/tutorFinancials.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/earnings', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getEarnings);

  fastify.get('/courses/analytics', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourseAnalytics);

  fastify.post('/payouts/request', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, requestPayout);

  fastify.get('/payouts/history', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPayoutHistory);
}