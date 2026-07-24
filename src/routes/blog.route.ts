import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listPublishedPosts, listAllPosts, getPostBySlug, getPostComments, addComment, deleteComment, createPost, updatePost, deletePost } from '../controllers/blog.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', listPublishedPosts);

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, listAllPosts);

  fastify.get('/:slug', getPostBySlug);

  fastify.get('/:slug/comments', getPostComments);

  fastify.post('/:slug/comments', { preHandler: [fastify.authenticate] }, addComment);

  fastify.delete('/comments/:id', { preHandler: [fastify.authenticate] }, deleteComment);

  fastify.post('/', { preHandler: [fastify.authenticate] }, createPost);

  fastify.put('/:id', { preHandler: [fastify.authenticate] }, updatePost);

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, deletePost);
}
