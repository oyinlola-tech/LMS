import { Post, PostLike } from '../../../models';
import { sequelize } from '../../../config/db.config';

export class LikePostCommand {
  async execute(userId: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const post = await Post.findByPk(postId);
    if (!post) {
      const err: any = new Error('Post not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const existing = await PostLike.findOne({ where: { postId, userId } });
    if (existing) {
      await existing.destroy();
      await post.decrement('likeCount');
      await post.reload();
      return { liked: false, likeCount: post.likeCount };
    }
    await PostLike.create({ postId, userId });
    await post.increment('likeCount');
    await post.reload();
    return { liked: true, likeCount: post.likeCount };
  }
}
export const likePostCommand = new LikePostCommand();
