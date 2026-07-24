import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getOverview, getExport, getSubmissionQueue } from '../controllers/tutorDashboard.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getOverview);

  fastify.get('/export', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getExport);

  fastify.get('/submission-queue', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getSubmissionQueue);
}
