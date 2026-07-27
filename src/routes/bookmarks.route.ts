import { FastifyInstance } from 'fastify';
import { listBookmarks, deleteBookmark } from '../controllers/bookmarks.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('students/pages/bookmarks.html');
    await fastify.authenticate(request, reply);
    if (reply.sent) return;
    return listBookmarks(request, reply);
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteBookmark);
}
