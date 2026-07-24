import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../core/loggers';
import { verifyWebhookSignature, ingestSendbyteWebhook } from '../services/mail/webhook.util';
import { Payment, Enrollment } from '../models';
import { PaymentStatus } from '../enums';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co';

export async function handleSendbyteWebhook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const secret = process.env.SENDBYTE_WEBHOOK_SECRET || '';
    const signature = request.headers['sendbyte-signature'] as string | undefined;
    const req = request as any;
    const rawBody = req.rawBody || JSON.stringify(request.body);

    if (!secret) {
      logger.warn('[Webhook] SENDBYTE_WEBHOOK_SECRET not configured, accepting without verification');
    } else if (signature) {
      const valid = verifyWebhookSignature(secret, signature, rawBody);
      if (!valid) {
        return reply.status(401).send({ error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature invalid' } });
      }
    }

    await ingestSendbyteWebhook(rawBody, signature, secret);
    return reply.status(200).send({ status: 'ok' });
  } catch (err) {
    logger.error('[Webhook] Handler error: ' + (err instanceof Error ? err.message : String(err)));
    return reply.status(200).send({ status: 'ok' });
  }
}

export async function handlePaystackWebhook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET_KEY || '';
    const hash = request.headers['x-paystack-signature'] as string | undefined;
    const rawBody = JSON.stringify(request.body);
    const expected = require('crypto').createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== expected) {
      return reply.status(401).send({ error: { code: 'INVALID_SIGNATURE', message: 'Paystack webhook signature invalid' } });
    }

    const event = request.body as any;
    if (event.event === 'charge.success') {
      const ref = event.data.reference;

      const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(ref)}`, {
        headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const result = await response.json() as any;
      if (!result.status || !result.data || result.data.status !== 'success') {
        logger.warn('[Webhook] Paystack verification failed for ref: ' + ref);
        return reply.status(200).send({ status: 'ignored' });
      }

      const payment = await Payment.findOne({ where: { reference: ref } });
      if (payment && payment.status !== PaymentStatus.COMPLETED) {
        payment.status = PaymentStatus.COMPLETED;
        payment.paidAt = new Date().toISOString();
        await payment.save();

        const existingEnrollment = await Enrollment.findOne({
          where: { UserId: payment.UserId, CourseId: payment.CourseId },
        });
        if (!existingEnrollment) {
          await Enrollment.create({
            UserId: payment.UserId,
            CourseId: payment.CourseId,
            status: 'active',
            pricePaid: payment.amount,
            currency: payment.currency,
            startedAt: new Date().toISOString(),
          });
          logger.info('[Webhook] Enrollment created for user ' + payment.UserId + ' course ' + payment.CourseId);
        }
      }
    }
    return reply.status(200).send({ status: 'ok' });
  } catch {
    return reply.status(200).send({ status: 'ok' });
  }
}
