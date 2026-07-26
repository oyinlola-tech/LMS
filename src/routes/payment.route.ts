import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/payment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/initialize', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, initializePayment);

  fastify.post('/verify', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, verifyPayment);

  fastify.get('/history', { preHandler: [fastify.authenticate] }, getPaymentHistory);
}
