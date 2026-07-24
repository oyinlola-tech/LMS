import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listReports, getReport, resolveReport, listWarnings } from '../controllers/adminReports.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/reports', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listReports);

  fastify.get('/reports/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getReport);

  fastify.post('/reports/:id/resolve', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, resolveReport);

  fastify.get('/warnings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listWarnings);
}
