import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { handleSendbyteWebhook, handlePaystackWebhook } from '../controllers/webhook.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/sendbyte', handleSendbyteWebhook);
  fastify.post('/paystack', handlePaystackWebhook);
}