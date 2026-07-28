import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listPublishedPosts, listAllPosts, getPostBySlug, getPostComments, addComment, deleteComment, createPost, updatePost, deletePost } from '../controllers/blog.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listPublishedPosts);

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listAllPosts);

  fastify.get('/:slug', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPostBySlug);

  fastify.get('/:slug/comments', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPostComments);

  fastify.post('/:slug/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addComment);

  fastify.delete('/comments/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteComment);

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createPost);

  fastify.put('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updatePost);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deletePost);
}