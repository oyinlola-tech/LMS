import { PostComment, PostCommentLike } from '../../../models';

export class LikeCommentCommand {
  async execute(userId: string, commentId: string): Promise<{ liked: boolean; likeCount: number }> {
    const comment = await PostComment.findByPk(commentId);
    if (!comment) {
      const err: any = new Error('Comment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const existing = await PostCommentLike.findOne({ where: { commentId, userId } });
    if (existing) {
      await existing.destroy();
      await comment.decrement('likeCount');
      await comment.reload();
      return { liked: false, likeCount: comment.likeCount };
    }
    await PostCommentLike.create({ commentId, userId });
    await comment.increment('likeCount');
    await comment.reload();
    return { liked: true, likeCount: comment.likeCount };
  }
}
export const likeCommentCommand = new LikeCommentCommand();
