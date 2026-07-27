import { FastifyInstance } from 'fastify';
import {
  createPost, likePost, commentOnPost, likeComment,
  bookmarkPost, reportContent, deletePost,
  getTimeline, getPostComments, getUserPosts, getRecommendedUsers, getRecommendedCourses,
} from '../controllers/timeline.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTimeline);

  fastify.post('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createPost);

  fastify.get('/recommended-users', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getRecommendedUsers);

  fastify.get('/recommended-courses', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getRecommendedCourses);

  fastify.get('/user/:userId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserPosts);

  fastify.post('/:postId/like', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, likePost);

  fastify.post('/:postId/comment', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, commentOnPost);

  fastify.get('/:postId/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPostComments);

  fastify.post('/:postId/bookmark', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, bookmarkPost);

  fastify.post('/:postId/report', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, reportContent);

  fastify.delete('/:postId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deletePost);

  fastify.post('/comments/:commentId/like', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, likeComment);
}
