import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Follow, User } from '../models';
import { ok, created, error } from '../utils/response.util';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/:userId/followers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      const followers = await Follow.findAll({
        where: { followingId: userId },
        include: [{ model: User, as: 'follower', attributes: ['id', 'fullName', 'avatarUrl'] }],
        limit: 50,
      });
      return ok(reply, followers, 'Followers loaded');
    } catch (err) {
      request.log.error(err, 'FOLLOWERS_LIST_FAILED');
      return error(reply, 500, 'FOLLOWERS_LIST_FAILED', 'Failed to load followers');
    }
  });

  fastify.get('/:userId/following', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      const following = await Follow.findAll({
        where: { followerId: userId },
        include: [{ model: User, as: 'following', attributes: ['id', 'fullName', 'avatarUrl'] }],
        limit: 50,
      });
      return ok(reply, following, 'Following loaded');
    } catch (err) {
      request.log.error(err, 'FOLLOWING_LIST_FAILED');
      return error(reply, 500, 'FOLLOWING_LIST_FAILED', 'Failed to load following');
    }
  });

  fastify.post('/:userId/follow', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      if (userId === request.user!.sub) return error(reply, 400, 'SELF_FOLLOW', 'You cannot follow yourself');
      const target = await User.findByPk(userId);
      if (!target) return error(reply, 404, 'NOT_FOUND', 'User not found');
      const existing = await Follow.findOne({ where: { followerId: request.user!.sub, followingId: userId } });
      if (existing) return error(reply, 409, 'ALREADY_FOLLOWING', 'You are already following this user');
      await Follow.create({ followerId: request.user!.sub, followingId: userId });
      return created(reply, null, 'Now following ' + target.fullName);
    } catch (err) {
      request.log.error(err, 'FOLLOW_FAILED');
      return error(reply, 500, 'FOLLOW_FAILED', 'Failed to follow user');
    }
  });

  fastify.post('/:userId/unfollow', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      const deleted = await Follow.destroy({ where: { followerId: request.user!.sub, followingId: userId } });
      if (!deleted) return error(reply, 404, 'NOT_FOLLOWING', 'You are not following this user');
      return ok(reply, null, 'Unfollowed');
    } catch (err) {
      request.log.error(err, 'UNFOLLOW_FAILED');
      return error(reply, 500, 'UNFOLLOW_FAILED', 'Failed to unfollow user');
    }
  });

  fastify.get('/:userId/status', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      const follow = await Follow.findOne({ where: { followerId: request.user!.sub, followingId: userId } });
      const count = await Follow.count({ where: { followerId: userId } });
      return ok(reply, { isFollowing: !!follow, followingCount: count }, 'Follow status');
    } catch (err) {
      request.log.error(err, 'FOLLOW_STATUS_FAILED');
      return error(reply, 500, 'FOLLOW_STATUS_FAILED', 'Failed to get follow status');
    }
  });
}
