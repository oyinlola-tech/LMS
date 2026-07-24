import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  listDiscussionThreads,
  getDiscussionThread,
  createDiscussionThread,
  createDiscussionReply,
} from '../controllers/discussions.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/threads', { preHandler: [fastify.authenticate] }, listDiscussionThreads);

  fastify.get('/threads/:id', { preHandler: [fastify.authenticate] }, getDiscussionThread);

  fastify.post('/threads', { preHandler: [fastify.authenticate] }, createDiscussionThread);

  fastify.post('/threads/:id/replies', { preHandler: [fastify.authenticate] }, createDiscussionReply);
}