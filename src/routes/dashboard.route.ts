import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getOverview } from '../controllers/dashboard.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getOverview);
}