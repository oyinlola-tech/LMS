import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { createTutor, createAdmin, toggleCheckmark } from '../controllers/admin.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/create-tutor', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createTutor);

  fastify.post('/create-admin', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createAdmin);

  fastify.put('/checkmark/:userId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, toggleCheckmark);
}
