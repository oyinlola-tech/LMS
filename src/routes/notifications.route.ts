import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listNotifications, streamNotifications, createNotification, markRead, markAllRead } from '../controllers/notifications.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('pages/notifications.html');
    return listNotifications(request, reply);
  });

  fastify.get('/stream', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, streamNotifications);

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createNotification);

  fastify.put('/:id/read', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, markRead);

  fastify.post('/mark-all-read', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, markAllRead);
}
