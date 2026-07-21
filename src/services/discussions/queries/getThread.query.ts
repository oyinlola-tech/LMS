import { DiscussionThread, DiscussionReply, User, Course } from '../../../models';

export class GetThreadQuery {
  async execute(threadId: string, params: { limit?: number; offset?: number }) {
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = Math.max(0, params.offset || 0);

    const thread = await DiscussionThread.findByPk(threadId, {
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }, { model: Course, attributes: ['id', 'title'] }],
    });
    if (!thread) return null;

    const replies = await DiscussionReply.findAll({
      where: { DiscussionThreadId: thread.id },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['createdAt', 'ASC']], limit, offset,
    });
    const replyCount = await DiscussionReply.count({ where: { DiscussionThreadId: thread.id } });

    return {
      thread: { id: thread.id, title: thread.title, body: thread.body, course: (thread as any).Course, author: (thread as any).User, createdAt: thread.createdAt, updatedAt: thread.updatedAt },
      replies, replyCount,
    };
  }
}
export const getThreadQuery = new GetThreadQuery();
