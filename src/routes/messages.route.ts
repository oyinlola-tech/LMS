import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getUnreadCount,
  markThreadRead,
  listThreads,
  getThread,
  uploadAttachment,
  createThread,
  replyToThread,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockStatus,
  reportUser,
} from '../controllers/messages.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/unread-count', { preHandler: [fastify.authenticate] }, getUnreadCount);

  fastify.post('/threads/:threadId/read', { preHandler: [fastify.authenticate] }, markThreadRead);

  fastify.get('/threads', { preHandler: [fastify.authenticate] }, listThreads);

  fastify.get('/threads/:threadId', { preHandler: [fastify.authenticate] }, getThread);

  fastify.post('/upload', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadAttachment);

  fastify.post('/threads', { preHandler: [fastify.authenticate] }, createThread);

  fastify.post('/threads/:threadId/messages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, replyToThread);

  fastify.post('/block/:userId', { preHandler: [fastify.authenticate] }, blockUser);

  fastify.delete('/block/:userId', { preHandler: [fastify.authenticate] }, unblockUser);

  fastify.get('/blocked', { preHandler: [fastify.authenticate] }, getBlockedUsers);

  fastify.get('/blocked/:userId', { preHandler: [fastify.authenticate] }, getBlockStatus);

  fastify.post('/report/:userId', { preHandler: [fastify.authenticate] }, reportUser);
}