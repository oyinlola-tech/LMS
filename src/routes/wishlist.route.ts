import { FastifyInstance } from 'fastify';
import { listWishlist, addToWishlist, removeFromWishlist, checkWishlist } from '../controllers/wishlist.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const accept = String(request.headers.accept || '');
    if (accept.includes('text/html')) return reply.sendFile('students/pages/wishlist.html');
    await fastify.authenticate(request, reply);
    if (reply.sent) return;
    return listWishlist(request, reply);
  });

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addToWishlist);

  fastify.delete('/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, removeFromWishlist);

  fastify.get('/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, checkWishlist);
}
