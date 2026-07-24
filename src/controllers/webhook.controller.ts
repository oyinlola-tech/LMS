import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../core/loggers';
import { verifyWebhookSignature, ingestSendbyteWebhook } from '../services/mail/webhook.util';

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
