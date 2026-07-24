import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getAdminDashboard, exportAdminDashboard, getReport, getAuditTrail } from '../controllers/adminDashboard.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, getAdminDashboard);

  fastify.get('/export', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, exportAdminDashboard);

  fastify.get('/report', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, getReport);

  fastify.get('/audit', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, getAuditTrail);
}
