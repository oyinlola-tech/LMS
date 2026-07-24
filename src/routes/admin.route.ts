import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { createTutor } from '../controllers/admin.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/create-tutor', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, createTutor);
}
