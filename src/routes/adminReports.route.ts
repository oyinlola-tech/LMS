import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listReports, getReport, resolveReport, listWarnings, listMyWarnings, markWarningRead, dismissReport, issueWarning } from '../controllers/adminReports.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/reports', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listReports);

  fastify.get('/reports/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getReport);

  fastify.post('/reports/:id/resolve', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, resolveReport);

  fastify.get('/warnings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listWarnings);

  fastify.get('/warnings/my', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listMyWarnings);

  fastify.put('/warnings/:id/read', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, markWarningRead);

  fastify.post('/reports/:id/dismiss', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, dismissReport);

  fastify.post('/warnings', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, issueWarning);
}
