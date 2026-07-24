import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listEmailLogs, getEmailLog } from '../controllers/adminEmail.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/emails/logs', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, listEmailLogs);

  fastify.get('/emails/logs/:id', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)] }, getEmailLog);
}
