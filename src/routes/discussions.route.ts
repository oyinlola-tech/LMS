import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { listThreadsQuery } from '../services/discussions/queries/listThreads.query';
import { getThreadQuery } from '../services/discussions/queries/getThread.query';
import { createThreadCommand } from '../services/discussions/commands/createThread.command';
import { createReplyCommand } from '../services/discussions/commands/createReply.command';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/threads', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page, limit, courseId, q } = request.query as any;
      const result = await listThreadsQuery.execute({ page: Number(page), limit: Number(limit), courseId, q });
      return ok(reply, result, 'Threads loaded');
    } catch (err: any) {
      return error(reply, 500, 'THREADS_LOAD_FAILED', 'Failed to load threads');
    }
  });

  fastify.get('/threads/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit, offset } = request.query as any;
      const result = await getThreadQuery.execute((request.params as any).id, { limit: Number(limit), offset: Number(offset) });
      if (!result) return error(reply, 404, 'NOT_FOUND', 'Thread not found');
      return ok(reply, result, 'Thread loaded');
    } catch (err: any) {
      return error(reply, 500, 'THREAD_LOAD_FAILED', 'Failed to load thread');
    }
  });

  fastify.post('/threads', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const thread = await createThreadCommand.execute(request.user!.sub, (request.body as any) || {});
      return created(reply, thread, 'Thread created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'THREAD_CREATE_FAILED', err.message || 'Failed to create thread');
    }
  });

  fastify.post('/threads/:id/replies', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { body } = (request.body as Record<string, any>) || {};
      const newReply = await createReplyCommand.execute(request.user!.sub, (request.params as any).id, body);
      return created(reply, newReply, 'Reply added');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'REPLY_CREATE_FAILED', err.message || 'Failed to add reply');
    }
  });
}
