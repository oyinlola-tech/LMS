import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { initializePaymentCommand } from '../services/payment/commands/initializePayment.command';
import { verifyPaymentCommand } from '../services/payment/commands/verifyPayment.command';
import { getPaymentQuery } from '../services/payment/queries/getPayment.query';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/initialize', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { courseId } = (request.body as Record<string, any>) || {};
      if (!courseId) return error(reply, 400, 'VALIDATION_ERROR', 'courseId is required');
      const result = await initializePaymentCommand.execute(request.user!.sub, courseId);
      return created(reply, result, 'Payment initialized');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'INIT_FAILED', err.message || 'Failed to initialize payment');
    }
  });

  fastify.post('/verify', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { reference } = (request.body as Record<string, any>) || {};
      if (!reference) return error(reply, 400, 'VALIDATION_ERROR', 'reference is required');
      const result = await verifyPaymentCommand.execute(request.user!.sub, reference);
      return ok(reply, result, 'Payment verified');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'VERIFY_FAILED', err.message || 'Failed to verify payment');
    }
  });

  fastify.get('/history', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { courseId } = request.query as any;
      const payments = await getPaymentQuery.execute(request.user!.sub, courseId);
      return ok(reply, payments, 'Payment history loaded');
    } catch (err: any) {
      return error(reply, 500, 'HISTORY_FAILED', 'Failed to load payment history');
    }
  });

  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY || '';
      const hash = request.headers['x-paystack-signature'] as string;
      const body = JSON.stringify(request.body);
      const expected = require('crypto').createHmac('sha512', secret).update(body).digest('hex');
      if (hash !== expected) return reply.status(401).send({ error: 'Invalid signature' });

      const event = request.body as any;
      if (event.event === 'charge.success') {
        const ref = event.data.reference;
        const payment = await (await import('../models')).Payment.findOne({ where: { reference: ref } });
        if (payment && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.paidAt = new Date().toISOString();
          await payment.save();
          const existing = await (await import('../models')).Enrollment.findOne({
            where: { UserId: payment.UserId, CourseId: payment.CourseId },
          });
          if (!existing) {
            await (await import('../models')).Enrollment.create({
              UserId: payment.UserId,
              CourseId: payment.CourseId,
              status: 'active',
              pricePaid: payment.amount,
              currency: payment.currency,
              startedAt: new Date().toISOString(),
            });
          }
        }
      }
      return reply.status(200).send({ status: 'ok' });
    } catch {
      return reply.status(200).send({ status: 'ok' });
    }
  });
}
