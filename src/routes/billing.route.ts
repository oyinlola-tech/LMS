import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { subscribe, getSubscription } from '../controllers/billing.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/subscribe', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, subscribe);

  fastify.get('/subscription', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getSubscription);
}