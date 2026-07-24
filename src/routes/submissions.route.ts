import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listSubmissions } from '../controllers/submissions.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, listSubmissions);
}