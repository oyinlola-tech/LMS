import { AssignmentSubmission, Assignment, Course } from '../../../models';

export class ListSubmissionsQuery {
  async execute(userId: string, params: { page?: number; limit?: number }): Promise<{ items: AssignmentSubmission[]; page: number; limit: number; total: number; totalPages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const { rows, count } = await AssignmentSubmission.findAndCountAll({
      where: { UserId: userId },
      include: [{ model: Assignment, include: [{ model: Course, attributes: ['id', 'title', 'thumbnailUrl'] }] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { items: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  }
}
export const listSubmissionsQuery = new ListSubmissionsQuery();
