import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { ok, created, error } from '../utils/response.util';
import { Message, MessageThread, User } from '../models';
import { listThreadsQuery } from '../services/messages/queries/listThreads.query';
import { getThreadMessagesQuery } from '../services/messages/queries/getThreadMessages.query';
import { sendMessageCommand } from '../services/messages/commands/createMessage.command';
import { replyToThreadCommand } from '../services/messages/commands/replyToThread.command';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/unread-count', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user!.sub;
      const threadIds = (await MessageThread.findAll({
        where: { [Op.or]: [{ userAId: userId }, { userBId: userId }] },
        attributes: ['id'],
      })).map(t => t.id);

      const unread = threadIds.length
        ? await Message.count({ where: { MessageThreadId: { [Op.in]: threadIds }, senderId: { [Op.ne]: userId }, readAt: null } })
        : 0;

      return ok(reply, { count: unread }, 'Unread count');
    } catch {
      return error(reply, 500, 'UNREAD_FAILED', 'Failed to get unread count');
    }
  });

  fastify.post('/threads/:threadId/read', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user!.sub;
      const threadId = (request.params as any).threadId;
      await Message.update(
        { readAt: new Date().toISOString() },
        { where: { MessageThreadId: threadId, senderId: { [Op.ne]: userId }, readAt: null } }
      );
      return ok(reply, null, 'Marked as read');
    } catch {
      return error(reply, 500, 'READ_FAILED', 'Failed to mark as read');
    }
  });

  fastify.get('/threads', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { search, cursor, page, limit } = request.query as any;
      const result = await listThreadsQuery.execute(request.user!.sub, {
        search, cursor, page: Number(page), limit: Number(limit),
      });
      return ok(reply, result, 'Threads loaded');
    } catch (err: any) {
      return error(reply, 500, 'THREADS_FAILED', 'Failed to load threads');
    }
  });

  fastify.get('/threads/:threadId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { cursor, page, limit } = request.query as any;
      const result = await getThreadMessagesQuery.execute(
        request.user!.sub, (request.params as any).threadId,
        { cursor, page: Number(page), limit: Number(limit) }
      );
      return ok(reply, result, 'Thread loaded');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'THREAD_LOAD_FAILED', err.message || 'Failed to load thread');
    }
  });

  fastify.post('/threads', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { participantId, subject, message } = (request.body as Record<string, any>) || {};
      const result = await sendMessageCommand.execute(request.user!.sub, participantId, { subject, message });
      return created(reply, { threadId: result.threadId, message: result.message }, 'Thread created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'THREAD_CREATE_FAILED', err.message || 'Failed to create thread');
    }
  });

  fastify.post('/threads/:threadId/messages', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { body } = (request.body as Record<string, any>) || {};
      const message = await replyToThreadCommand.execute(request.user!.sub, (request.params as any).threadId, body);
      return created(reply, message, 'Message sent');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MESSAGE_SEND_FAILED', err.message || 'Failed to send message');
    }
  });
}
