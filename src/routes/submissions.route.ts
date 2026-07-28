import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listSubmissions } from '../controllers/submissions.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listSubmissions);
}