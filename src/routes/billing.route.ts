import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { subscribe, getSubscription } from '../controllers/billing.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/subscribe', { preHandler: [fastify.authenticate] }, subscribe);

  fastify.get('/subscription', { preHandler: [fastify.authenticate] }, getSubscription);
}