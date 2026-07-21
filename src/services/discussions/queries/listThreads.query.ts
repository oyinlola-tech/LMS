import { Op } from 'sequelize';
import { DiscussionThread, DiscussionReply, User, Course } from '../../../models';

const escapeLikePattern = (value: string) => String(value).replace(/[\\%_]/g, '\\$&');

export class ListThreadsQuery {
  async execute(params: { page?: number; limit?: number; courseId?: string; q?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const where: any = {};
    if (params.courseId) where.CourseId = params.courseId;
    if (params.q) {
      const escaped = escapeLikePattern(params.q);
      where[Op.or] = [{ title: { [Op.like]: `%${escaped}%` } }, { body: { [Op.like]: `%${escaped}%` } }];
    }

    const { rows, count } = await DiscussionThread.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }, { model: Course, attributes: ['id', 'title'] }],
      order: [['updatedAt', 'DESC']],
      limit, offset,
    });

    const threadIds = rows.map((t: any) => t.id);
    let replyCounts: Record<string, number> = {};
    if (threadIds.length) {
      const counts = await DiscussionReply.findAll({
        where: { DiscussionThreadId: { [Op.in]: threadIds } },
        attributes: ['DiscussionThreadId', [DiscussionReply.sequelize!.fn('COUNT', DiscussionReply.sequelize!.col('id')), 'count']],
        group: ['DiscussionThreadId'],
      });
      replyCounts = counts.reduce((acc: any, row: any) => { acc[row.DiscussionThreadId] = Number(row.get('count')); return acc; }, {});
    }

    const items = rows.map((thread: any) => ({
      id: thread.id, title: thread.title, body: thread.body,
      course: thread.Course, author: thread.User,
      replyCount: replyCounts[thread.id] || 0,
      createdAt: thread.createdAt, updatedAt: thread.updatedAt,
    }));

    return { items, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  }
}
export const listThreadsQuery = new ListThreadsQuery();
