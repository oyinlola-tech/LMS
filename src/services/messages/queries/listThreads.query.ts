import { Op } from 'sequelize';
import { MessageThread, Message, User } from '../../../models';

const escapeLikePattern = (value: string) => String(value).replace(/[\\%_]/g, '\\$&');

export class ListThreadsQuery {
  async execute(userId: string, params: { page?: number; limit?: number; search?: string; cursor?: string }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 20)));
    const offset = (page - 1) * limit;
    const search = String(params.search || '').trim();
    const escapedSearch = escapeLikePattern(search);
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

    const where: any = { [Op.or]: [{ userAId: userId }, { userBId: userId }] };
    if (search) {
      where[Op.and] = [{
        [Op.or]: [
          { subject: { [Op.like]: `%${escapedSearch}%` } },
          { '$userA.fullName$': { [Op.like]: `%${escapedSearch}%` } },
          { '$userB.fullName$': { [Op.like]: `%${escapedSearch}%` } },
        ],
      }];
    }
    if (decodedCursor) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        { [Op.or]: [
          { lastMessageAt: { [Op.lt]: decodedCursor.date } },
          { lastMessageAt: decodedCursor.date, id: { [Op.lt]: decodedCursor.id } },
        ]},
      ];
    }

    const { rows, count } = await MessageThread.findAndCountAll({
      where,
      include: [
        { model: User, as: 'userA', attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: User, as: 'userB', attributes: ['id', 'fullName', 'avatarUrl'] },
      ],
      order: [['lastMessageAt', 'DESC']],
      limit,
      offset: decodedCursor ? 0 : offset,
      subQuery: false,
    });

    const threadIds = rows.map((thread: any) => thread.id);
    const lastMessageByThreadId = new Map();
    if (threadIds.length) {
      const messages = await Message.findAll({
        where: { MessageThreadId: { [Op.in]: threadIds } },
        order: [['MessageThreadId', 'ASC'], ['createdAt', 'DESC'], ['id', 'DESC']],
      });
      for (const message of messages) {
        if (!lastMessageByThreadId.has(message.MessageThreadId)) {
          lastMessageByThreadId.set(message.MessageThreadId, message);
        }
      }
    }

    const mapped = rows.map((thread: any) => {
      const isUserA = thread.userAId === userId;
      const otherUser = isUserA ? thread.userB : thread.userA;
      return {
        id: thread.id,
        subject: thread.subject,
        participant: otherUser,
        lastMessage: lastMessageByThreadId.get(thread.id) || null,
        lastMessageAt: thread.lastMessageAt,
      };
    });

    const lastItem = rows[rows.length - 1];
    let nextCursor: string | null = null;
    if (lastItem) {
      const raw = `${new Date(lastItem.lastMessageAt).toISOString()}|${lastItem.id}`;
      nextCursor = Buffer.from(raw).toString('base64url');
    }

    return {
      items: mapped,
      page: decodedCursor ? null : page,
      limit,
      total: count,
      totalPages: decodedCursor ? null : Math.ceil(count / limit),
      nextCursor,
    };
  }
}
export const listThreadsQuery = new ListThreadsQuery();
