import { Op } from 'sequelize';
import { Post, User, PostLike, PostBookmark } from '../../../models';

export class GetUserPostsQuery {
  async execute(currentUserId: string | null, targetUserId: string, params: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 20)));
    const offset = (page - 1) * limit;

    const { rows, count } = await Post.findAndCountAll({
      where: { userId: targetUserId },
      include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const postIds = rows.map(p => p.id);
    let likedPostIds = new Set<string>();
    let bookmarkedPostIds = new Set<string>();
    if (currentUserId) {
      const userLikes = await PostLike.findAll({
        where: { postId: { [Op.in]: postIds }, userId: currentUserId },
        attributes: ['postId'],
      });
      likedPostIds = new Set(userLikes.map(l => l.postId));
      const userBookmarks = await PostBookmark.findAll({
        where: { postId: { [Op.in]: postIds }, userId: currentUserId },
        attributes: ['postId'],
      });
      bookmarkedPostIds = new Set(userBookmarks.map(b => b.postId));
    }

    const items = rows.map(post => ({
      ...post.toJSON(),
      isLiked: likedPostIds.has(post.id),
      isBookmarked: bookmarkedPostIds.has(post.id),
    }));

    return { items, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  }
}
export const getUserPostsQuery = new GetUserPostsQuery();
