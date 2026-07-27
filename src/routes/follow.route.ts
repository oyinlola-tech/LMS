import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFollowers, getFollowing, getPendingRequests, approveFollow, rejectFollow, followUser, unfollowUser, getFollowStatus } from '../controllers/follow.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:userId/followers', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getFollowers);

  fastify.get('/:userId/following', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getFollowing);

  fastify.get('/requests/pending', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getPendingRequests);

  fastify.post('/requests/:userId/approve', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, approveFollow);

  fastify.post('/requests/:userId/reject', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, rejectFollow);

  fastify.post('/:userId/follow', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, followUser);

  fastify.post('/:userId/unfollow', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, unfollowUser);

  fastify.get('/:userId/status', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getFollowStatus);
}
