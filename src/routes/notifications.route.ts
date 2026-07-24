import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listNotifications, streamNotifications, createNotification, markRead, markAllRead } from '../controllers/notifications.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, listNotifications);

  fastify.get('/stream', { preHandler: [fastify.authenticate] }, streamNotifications);

  fastify.post('/', { preHandler: [fastify.authenticate] }, createNotification);

  fastify.put('/:id/read', { preHandler: [fastify.authenticate] }, markRead);

  fastify.post('/mark-all-read', { preHandler: [fastify.authenticate] }, markAllRead);
}
