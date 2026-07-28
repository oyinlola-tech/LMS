import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getOverview, getExport, getSubmissionQueue } from '../controllers/tutorDashboard.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getOverview);

  fastify.get('/export', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getExport);

  fastify.get('/submission-queue', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getSubmissionQueue);
}