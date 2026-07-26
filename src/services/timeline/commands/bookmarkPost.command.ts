import { Post, PostBookmark } from '../../../models';

export class BookmarkPostCommand {
  async execute(userId: string, postId: string): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
    const post = await Post.findByPk(postId);
    if (!post) {
      const err: any = new Error('Post not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const existing = await PostBookmark.findOne({ where: { postId, userId } });
    if (existing) {
      await existing.destroy();
      await post.decrement('bookmarkCount');
      await post.reload();
      return { bookmarked: false, bookmarkCount: post.bookmarkCount };
    }
    await PostBookmark.create({ postId, userId });
    await post.increment('bookmarkCount');
    await post.reload();
    return { bookmarked: true, bookmarkCount: post.bookmarkCount };
  }
}
export const bookmarkPostCommand = new BookmarkPostCommand();
