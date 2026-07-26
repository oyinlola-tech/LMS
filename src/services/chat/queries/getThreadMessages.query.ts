import { Op } from 'sequelize';
import { MessageThread, Message, User } from '../../../models';

export class GetThreadMessagesQuery {
  async execute(userId: string, threadId: string, params: { page?: number; limit?: number; cursor?: string }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit || 30)));
    const offset = (page - 1) * limit;
    let decodedCursor: { date: Date; id: string } | null = null;
    if (params.cursor) {
      try {
        const raw = Buffer.from(params.cursor, 'base64url').toString('utf8');
        const [iso, id] = raw.split('|');
        if (iso && id) {
          const date = new Date(iso);
          if (!Number.isNaN(date.getTime())) decodedCursor = { date, id };
        }
      } catch (_) {}
    }

    const thread = await MessageThread.findByPk(threadId, {
      include: [
        { model: User, as: 'userA', attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: User, as: 'userB', attributes: ['id', 'fullName', 'avatarUrl'] },
      ],
    });
    if (!thread) {
      const err: any = new Error('Thread not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (![thread.userAId, thread.userBId].includes(userId)) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const whereMessages: any = { MessageThreadId: thread.id };
    if (decodedCursor) {
      whereMessages[Op.or] = [
        { createdAt: { [Op.lt]: decodedCursor.date } },
        { createdAt: decodedCursor.date, id: { [Op.lt]: decodedCursor.id } },
      ];
    }

    const { rows, count } = await Message.findAndCountAll({
      where: whereMessages,
      include: [{ model: User, as: 'sender', attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: decodedCursor ? 0 : offset,
    });

    const items = rows.slice().reverse();
    const lastMessage = rows[rows.length - 1];
    let nextCursor: string | null = null;
    if (lastMessage) {
      const raw = `${new Date(lastMessage.createdAt).toISOString()}|${lastMessage.id}`;
      nextCursor = Buffer.from(raw).toString('base64url');
    }

    return {
      thread,
      items,
      page: decodedCursor ? null : page,
      limit,
      total: count,
      totalPages: decodedCursor ? null : Math.ceil(count / limit),
      nextCursor,
    };
  }
}
export const getThreadMessagesQuery = new GetThreadMessagesQuery();
