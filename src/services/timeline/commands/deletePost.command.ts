import { Post } from '../../../models';

export class DeletePostCommand {
  async execute(userId: string, postId: string, userRole: string): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) {
      const err: any = new Error('Post not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (post.userId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    await post.destroy();
  }
}
export const deletePostCommand = new DeletePostCommand();
