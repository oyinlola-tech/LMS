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
  fastify.get('/unread-count', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUnreadCount);

  fastify.post('/threads/:threadId/read', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, markThreadRead);

  fastify.get('/threads', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listThreads);

  fastify.get('/threads/:threadId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getThread);

  fastify.post('/upload', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadAttachment);

  fastify.post('/threads', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createThread);

  fastify.post('/threads/:threadId/messages', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, replyToThread);

  fastify.post('/block/:userId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, blockUser);

  fastify.delete('/block/:userId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, unblockUser);

  fastify.get('/blocked', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBlockedUsers);

  fastify.get('/blocked/:userId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBlockStatus);

  fastify.post('/report/:userId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, reportUser);
}