import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { ok, created, error } from '../utils/response.util';
import { Message, MessageThread, User } from '../models';
import { listThreadsQuery } from '../services/messages/queries/listThreads.query';
import { getThreadMessagesQuery } from '../services/messages/queries/getThreadMessages.query';
import { sendMessageCommand } from '../services/messages/commands/createMessage.command';
import { replyToThreadCommand } from '../services/messages/commands/replyToThread.command';
import { MAX_MESSAGE_ATTACHMENT_SIZE_MB } from '../utils/profanity.util';

const ALLOWED_ATTACHMENT_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/webm'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  archive: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/gzip'],
};

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
    } catch (err) {
      request.log.error(err, 'UNREAD_FAILED');
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
    } catch (err) {
      request.log.error(err, 'READ_FAILED');
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

  fastify.post('/upload', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) return error(reply, 400, 'VALIDATION_ERROR', 'file is required');

      const { file: stream, mimetype, filename: originalname } = data;

      const category = Object.keys(ALLOWED_ATTACHMENT_TYPES).find(k => ALLOWED_ATTACHMENT_TYPES[k].includes(mimetype));
      if (!category) return error(reply, 400, 'VALIDATION_ERROR', 'File type not allowed. Allowed: images, audio, documents, archives');

      const uploadDir = process.env.UPLOAD_DIR || './uploads/chat';
      fs.mkdirSync(uploadDir, { recursive: true });
      const ext = path.extname(originalname);
      const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '');
      const filename = Date.now() + '-' + crypto.randomUUID() + ext;
      const filePath = path.join(uploadDir, filename);

      const maxBytes = MAX_MESSAGE_ATTACHMENT_SIZE_MB * 1024 * 1024;
      const writeStream = fs.createWriteStream(filePath);
      let written = 0;
      stream.on('data', (chunk: Buffer) => { written += chunk.length; });
      stream.pipe(writeStream);
      await new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
        writeStream.on('error', reject);
      });
      if (written > maxBytes) {
        fs.unlink(filePath, () => {});
        return error(reply, 400, 'VALIDATION_ERROR', `File too large (max ${MAX_MESSAGE_ATTACHMENT_SIZE_MB}MB)`);
      }

      const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
      const url = publicBaseUrl ? publicBaseUrl + '/uploads/chat/' + filename : '/uploads/chat/' + filename;

      return created(reply, { url, type: mimetype, name: safeName, category }, 'File uploaded');
    } catch (err: any) {
      request.log.error(err, 'UPLOAD_FAILED');
      return error(reply, 500, 'UPLOAD_FAILED', 'Failed to upload file');
    }
  });

  fastify.post('/threads', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { participantId, subject, message, attachmentUrl, attachmentType, attachmentName } = (request.body as Record<string, any>) || {};
      const result = await sendMessageCommand.execute(request.user!.sub, participantId, { subject, message, attachmentUrl, attachmentType, attachmentName });
      return created(reply, { threadId: result.threadId, message: result.message }, 'Thread created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'THREAD_CREATE_FAILED', err.message || 'Failed to create thread');
    }
  });

  fastify.post('/threads/:threadId/messages', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { body, attachmentUrl, attachmentType, attachmentName } = (request.body as Record<string, any>) || {};
      const message = await replyToThreadCommand.execute(request.user!.sub, (request.params as any).threadId, body, { url: attachmentUrl, type: attachmentType, name: attachmentName });
      return created(reply, message, 'Message sent');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MESSAGE_SEND_FAILED', err.message || 'Failed to send message');
    }
  });
}
