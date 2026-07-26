import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { handleSendbyteWebhook, handlePaystackWebhook } from '../controllers/webhook.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/sendbyte', { config: { rateLimit: { max: 50, timeWindow: '1 minute' } } }, handleSendbyteWebhook);

  fastify.post('/paystack', { config: { rateLimit: { max: 50, timeWindow: '1 minute' } } }, handlePaystackWebhook);
}
