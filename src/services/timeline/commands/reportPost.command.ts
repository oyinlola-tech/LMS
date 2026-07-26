import { PostReport, Post, PostComment } from '../../../models';

export class ReportPostCommand {
  async execute(params: {
    reporterId: string;
    reason: string;
    postId?: string;
    commentId?: string;
  }): Promise<PostReport> {
    const { reporterId, reason, postId, commentId } = params;
    if (!reason || !reason.trim()) {
      const err: any = new Error('Reason is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (!postId && !commentId) {
      const err: any = new Error('Either postId or commentId is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (postId) {
      const post = await Post.findByPk(postId);
      if (!post) {
        const err: any = new Error('Post not found');
        err.code = 'NOT_FOUND';
        err.statusCode = 404;
        throw err;
      }
    }
    if (commentId) {
      const comment = await PostComment.findByPk(commentId);
      if (!comment) {
        const err: any = new Error('Comment not found');
        err.code = 'NOT_FOUND';
        err.statusCode = 404;
        throw err;
      }
    }
    const report = await PostReport.create({
      reporterId,
      reason: reason.trim(),
      postId: postId || null,
      commentId: commentId || null,
    });
    return report;
  }
}
export const reportPostCommand = new ReportPostCommand();
