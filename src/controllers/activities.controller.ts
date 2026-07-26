import { FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { AdminAuditLog, User, Post, PostComment, PostLike, Follow } from '../models';
import { ok, error } from '../utils/response.util';

export const getAdminActivities = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page, limit, userId } = request.query as any;
    const pageNum = Math.max(1, Number(page || 1));
    const limitNum = Math.min(50, Math.max(1, Number(limit || 20)));
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (userId) where.actorId = userId;

    const { rows, count } = await AdminAuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'actor', attributes: ['id', 'fullName', 'avatarUrl', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    return ok(reply, {
      items: rows,
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    }, 'Activities loaded');
  } catch (err: any) {
    return error(reply, 500, 'ACTIVITIES_FAILED', 'Failed to load activities');
  }
};

export const getUserActivities = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request.params as any).userId || request.user!.sub;
    const { page, limit } = request.query as any;
    const pageNum = Math.max(1, Number(page || 1));
    const limitNum = Math.min(50, Math.max(1, Number(limit || 20)));
    const offset = (pageNum - 1) * limitNum;

    const postCount = await Post.count({ where: { userId } });
    const likeCount = await PostLike.count({ where: { userId } });
    const commentCount = await PostComment.count({ where: { userId } });
    const followingCount = await Follow.count({ where: { followerId: userId } });
    const followerCount = await Follow.count({ where: { followingId: userId } });

    const recentPosts = await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'body', 'createdAt'],
    });

    const auditLogs = await AdminAuditLog.findAll({
      where: { actorId: userId },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    return ok(reply, {
      stats: { postCount, likeCount, commentCount, followingCount, followerCount },
      recentPosts,
      auditLogs,
      page: pageNum,
      limit: limitNum,
    }, 'User activities loaded');
  } catch (err: any) {
    return error(reply, 500, 'USER_ACTIVITIES_FAILED', 'Failed to load user activities');
  }
};
