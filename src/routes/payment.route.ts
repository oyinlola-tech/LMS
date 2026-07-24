import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/payment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/initialize', { preHandler: [fastify.authenticate] }, initializePayment);

  fastify.post('/verify', { preHandler: [fastify.authenticate] }, verifyPayment);

  fastify.get('/history', { preHandler: [fastify.authenticate] }, getPaymentHistory);
}