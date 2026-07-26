import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { Follow, User } from '../models';
import { ok, created, error } from '../utils/response.util';

export async function getFollowers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const currentUserId = request.user?.sub || null;
    const rows = await Follow.findAll({
      where: { followingId: userId, status: 'accepted' },
      include: [{ model: User, as: 'follower', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isPrivate', 'isVerified', 'checkmarkType'] }],
      limit: 50,
      order: [['createdAt', 'DESC']],
    });
    const followers = rows as any[];

    let followBackIds: string[] = [];
    if (currentUserId) {
      const followBacks = await Follow.findAll({
        where: { followerId: currentUserId, followingId: { [Op.in]: followers.map((f: any) => f.followerId) }, status: 'accepted' },
        attributes: ['followingId'],
      });
      followBackIds = followBacks.map(f => f.followingId);
    }

    const mapped = followers.map((f: any) => ({
      id: f.id,
      follower: f.follower,
      isFollowBack: followBackIds.includes(f.followerId),
      createdAt: f.createdAt,
    }));

    return ok(reply, mapped, 'Followers loaded');
  } catch (err) {
    request.log.error(err, 'FOLLOWERS_LIST_FAILED');
    return error(reply, 500, 'FOLLOWERS_LIST_FAILED', 'Failed to load followers');
  }
}

export async function getFollowing(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const rows = await Follow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'following', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isPrivate', 'isVerified', 'checkmarkType'] }],
      limit: 50,
      order: [['createdAt', 'DESC']],
    });
    return ok(reply, rows, 'Following loaded');
  } catch (err) {
    request.log.error(err, 'FOLLOWING_LIST_FAILED');
    return error(reply, 500, 'FOLLOWING_LIST_FAILED', 'Failed to load following');
  }
}

export async function getPendingRequests(request: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await Follow.findAll({
      where: { followingId: request.user!.sub, status: 'pending' },
      include: [{ model: User, as: 'follower', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return ok(reply, rows, 'Pending requests loaded');
  } catch (err) {
    request.log.error(err, 'PENDING_REQUESTS_FAILED');
    return error(reply, 500, 'PENDING_REQUESTS_FAILED', 'Failed to load pending requests');
  }
}

export async function approveFollow(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const follow = await Follow.findOne({
      where: { followerId: userId, followingId: request.user!.sub, status: 'pending' },
    });
    if (!follow) return error(reply, 404, 'NOT_FOUND', 'Pending request not found');
    await follow.update({ status: 'accepted' });
    return ok(reply, null, 'Follow request approved');
  } catch (err) {
    request.log.error(err, 'APPROVE_FAILED');
    return error(reply, 500, 'APPROVE_FAILED', 'Failed to approve follow request');
  }
}

export async function rejectFollow(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const deleted = await Follow.destroy({
      where: { followerId: userId, followingId: request.user!.sub, status: 'pending' },
    });
    if (!deleted) return error(reply, 404, 'NOT_FOUND', 'Pending request not found');
    return ok(reply, null, 'Follow request rejected');
  } catch (err) {
    request.log.error(err, 'REJECT_FAILED');
    return error(reply, 500, 'REJECT_FAILED', 'Failed to reject follow request');
  }
}

export async function followUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    if (userId === request.user!.sub) return error(reply, 400, 'SELF_FOLLOW', 'You cannot follow yourself');
    const target = await User.findByPk(userId);
    if (!target) return error(reply, 404, 'NOT_FOUND', 'User not found');
    const existing = await Follow.findOne({ where: { followerId: request.user!.sub, followingId: userId } });
    if (existing) {
      if (existing.status === 'pending') return error(reply, 409, 'REQUEST_PENDING', 'Follow request already pending');
      return error(reply, 409, 'ALREADY_FOLLOWING', 'You are already following this user');
    }

    const isPrivate = target.isPrivate;
    const status = isPrivate ? 'pending' : 'accepted';
    await Follow.create({ followerId: request.user!.sub, followingId: userId, status });

    if (isPrivate) {
      return created(reply, { status: 'pending' }, 'Follow request sent');
    }
    return created(reply, { status: 'accepted' }, 'Now following ' + target.fullName);
  } catch (err) {
    request.log.error(err, 'FOLLOW_FAILED');
    return error(reply, 500, 'FOLLOW_FAILED', 'Failed to follow user');
  }
}

export async function unfollowUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const deleted = await Follow.destroy({ where: { followerId: request.user!.sub, followingId: userId } });
    if (!deleted) return error(reply, 404, 'NOT_FOLLOWING', 'You are not following this user');
    return ok(reply, null, 'Unfollowed');
  } catch (err) {
    request.log.error(err, 'UNFOLLOW_FAILED');
    return error(reply, 500, 'UNFOLLOW_FAILED', 'Failed to unfollow user');
  }
}

export async function getFollowStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = request.params as { userId: string };
    const follow = await Follow.findOne({ where: { followerId: request.user!.sub, followingId: userId } });
    const doesFollowBack = await Follow.findOne({ where: { followerId: userId, followingId: request.user!.sub, status: 'accepted' } });
    const followerCount = await Follow.count({ where: { followingId: userId, status: 'accepted' } });
    const followingCount = await Follow.count({ where: { followerId: userId, status: 'accepted' } });

    const result: any = {
      isFollowing: !!follow && follow.status === 'accepted',
      isPending: !!follow && follow.status === 'pending',
      doesFollowBack: !!doesFollowBack,
      followerCount,
      followingCount,
    };

    if (follow) {
      result.status = follow.status;
      result.followId = follow.id;
    }

    return ok(reply, result, 'Follow status');
  } catch (err) {
    request.log.error(err, 'FOLLOW_STATUS_FAILED');
    return error(reply, 500, 'FOLLOW_STATUS_FAILED', 'Failed to get follow status');
  }
}
