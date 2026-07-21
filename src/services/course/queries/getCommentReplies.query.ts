import { courseCommentRepository } from '../../../repositories/courseComment.repository';

export class GetCommentRepliesQuery {
  async execute(commentId: string, page: number = 1, limit: number = 20): Promise<any> {
    const parent = await courseCommentRepository.findById(commentId);
    if (!parent) {
      const err: any = new Error('Comment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const { rows, count } = await courseCommentRepository.findReplies(commentId, page, limit);

    return {
      items: rows.map((r: any) => r.toJSON()),
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export const getCommentRepliesQuery = new GetCommentRepliesQuery();
