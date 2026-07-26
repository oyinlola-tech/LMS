import { FastifyInstance } from 'fastify';
import {
  createPost, likePost, commentOnPost, likeComment,
  bookmarkPost, reportContent, deletePost,
  getTimeline, getPostComments, getUserPosts, getRecommendedUsers,
} from '../controllers/timeline.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, getTimeline);

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createPost);

  fastify.get('/recommended-users', { preHandler: [fastify.authenticate] }, getRecommendedUsers);

  fastify.get('/user/:userId', { preHandler: [fastify.authenticate] }, getUserPosts);

  fastify.post('/:postId/like', { preHandler: [fastify.authenticate] }, likePost);

  fastify.post('/:postId/comment', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, commentOnPost);

  fastify.get('/:postId/comments', { preHandler: [fastify.authenticate] }, getPostComments);

  fastify.post('/:postId/bookmark', { preHandler: [fastify.authenticate] }, bookmarkPost);

  fastify.post('/:postId/report', { preHandler: [fastify.authenticate] }, reportContent);

  fastify.delete('/:postId', { preHandler: [fastify.authenticate] }, deletePost);

  fastify.post('/comments/:commentId/like', { preHandler: [fastify.authenticate] }, likeComment);
}
