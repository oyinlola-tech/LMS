import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFollowers, getFollowing, getPendingRequests, approveFollow, rejectFollow, followUser, unfollowUser, getFollowStatus } from '../controllers/follow.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:userId/followers', getFollowers);

  fastify.get('/:userId/following', getFollowing);

  fastify.get('/requests/pending', { preHandler: [fastify.authenticate] }, getPendingRequests);

  fastify.post('/requests/:userId/approve', { preHandler: [fastify.authenticate] }, approveFollow);

  fastify.post('/requests/:userId/reject', { preHandler: [fastify.authenticate] }, rejectFollow);

  fastify.post('/:userId/follow', { preHandler: [fastify.authenticate] }, followUser);

  fastify.post('/:userId/unfollow', { preHandler: [fastify.authenticate] }, unfollowUser);

  fastify.get('/:userId/status', { preHandler: [fastify.authenticate] }, getFollowStatus);
}
