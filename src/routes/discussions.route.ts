import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  listDiscussionThreads,
  getDiscussionThread,
  createDiscussionThread,
  createDiscussionReply,
} from '../controllers/discussions.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/threads', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listDiscussionThreads);

  fastify.get('/threads/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getDiscussionThread);

  fastify.post('/threads', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createDiscussionThread);

  fastify.post('/threads/:id/replies', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createDiscussionReply);
}