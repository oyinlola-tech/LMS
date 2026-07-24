import { FastifyInstance } from 'fastify';
import { listWishlist, addToWishlist, removeFromWishlist, checkWishlist } from '../controllers/wishlist.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, listWishlist);

  fastify.post('/', { preHandler: [fastify.authenticate] }, addToWishlist);

  fastify.delete('/:courseId', { preHandler: [fastify.authenticate] }, removeFromWishlist);

  fastify.get('/:courseId', { preHandler: [fastify.authenticate] }, checkWishlist);
}