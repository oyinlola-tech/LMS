import { Post, PostComment, User } from '../../../models';
import { containsFlaggedWords } from '../../../utils/profanity.util';

export class CommentPostCommand {
  async execute(params: {
    userId: string;
    postId: string;
    body: string;
    parentId?: string;
  }): Promise<PostComment> {
    const { userId, postId, body, parentId } = params;
    if (!body || !body.trim()) {
      const err: any = new Error('Comment body is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (body.length > 2000) {
      const err: any = new Error('Comment too long (max 2000 characters)');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const post = await Post.findByPk(postId);
    if (!post) {
      const err: any = new Error('Post not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (parentId) {
      const parent = await PostComment.findByPk(parentId);
      if (!parent) {
        const err: any = new Error('Parent comment not found');
        err.code = 'NOT_FOUND';
        err.statusCode = 404;
        throw err;
      }
    }
    const comment = await PostComment.create({ postId, userId, body: body.trim(), parentId: parentId || null });
    await post.increment('commentCount');
    return comment;
  }
}
export const commentPostCommand = new CommentPostCommand();
