import { Op } from 'sequelize';
import { PostComment, User, PostCommentLike } from '../../../models';

export class GetPostCommentsQuery {
  async execute(userId: string, postId: string, params: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 20)));
    const offset = (page - 1) * limit;

    const { rows, count } = await PostComment.findAndCountAll({
      where: { postId, parentId: null },
      include: [
        { model: User, as: 'commenter', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] },
        {
          model: PostComment,
          as: 'replies',
          include: [{ model: User, as: 'commenter', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const commentIds = rows.map(c => c.id);
    const userLikes = await PostCommentLike.findAll({
      where: { commentId: { [Op.in]: commentIds }, userId },
      attributes: ['commentId'],
    });
    const likedCommentIds = new Set(userLikes.map(l => l.commentId));

    const items = rows.map(comment => ({
      ...comment.toJSON(),
      isLiked: likedCommentIds.has(comment.id),
      replies: (comment as any).replies?.map((reply: any) => ({
        ...reply.toJSON(),
        isLiked: likedCommentIds.has(reply.id),
      })) || [],
    }));

    return { items, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  }
}
export const getPostCommentsQuery = new GetPostCommentsQuery();
