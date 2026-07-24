import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFollowers, getFollowing, followUser, unfollowUser, getFollowStatus } from '../controllers/follow.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:userId/followers', getFollowers);

  fastify.get('/:userId/following', getFollowing);

  fastify.post('/:userId/follow', { preHandler: [fastify.authenticate] }, followUser);

  fastify.post('/:userId/unfollow', { preHandler: [fastify.authenticate] }, unfollowUser);

  fastify.get('/:userId/status', { preHandler: [fastify.authenticate] }, getFollowStatus);
}
