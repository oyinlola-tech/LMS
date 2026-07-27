import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listNotifications, streamNotifications, createNotification, markRead, markAllRead } from '../controllers/notifications.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('', async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('pages/notifications.html');
    await fastify.authenticate(request, reply);
    if (reply.sent) return;
    return listNotifications(request, reply);
  });

  fastify.get('/stream', { preHandler: [fastify.authenticate] }, streamNotifications);

  fastify.post('/', { preHandler: [fastify.authenticate] }, createNotification);

  fastify.put('/:id/read', { preHandler: [fastify.authenticate] }, markRead);

  fastify.post('/mark-all-read', { preHandler: [fastify.authenticate] }, markAllRead);
}
