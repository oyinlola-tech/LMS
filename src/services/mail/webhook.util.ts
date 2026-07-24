import { logger } from '../../core/loggers';
import { EmailLog } from '../../models';
import crypto from 'crypto';

export function verifyWebhookSignature(secret: string, signatureHeader: string | undefined, body: string): boolean {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',');
  const tPart = parts.find(p => p.startsWith('t='));
  const v1Part = parts.find(p => p.startsWith('v1='));

  if (!tPart || !v1Part) return false;

  const timestamp = parseInt(tPart.slice(2), 10);
  const expectedSig = v1Part.slice(4);

  const tolerance = 300;
  if (Math.abs(Date.now() / 1000 - timestamp) > tolerance) {
    logger.warn('[Webhook] Signature timestamp out of tolerance');
    return false;
  }

  const signedPayload = `${timestamp}.${body}`;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'v1=' + hmac.update(signedPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from('v1=' + expectedSig));
}

export async function ingestSendbyteWebhook(rawBody: Buffer | string, signatureHeader: string | undefined, secret: string): Promise<void> {
  if (!signatureHeader || !secret) {
    logger.warn('[Webhook] Missing signature or secret');
    return;
  }

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');

  try {
    const payload = JSON.parse(body);
    const emailId = payload.data?.email_id || payload.data?.id || null;

    if (!emailId) {
      logger.warn('[Webhook] No email_id in payload');
      return;
    }

    const eventType = payload.type || 'unknown';
    const statusMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.unsubscribed': 'unsubscribed',
    };

    const newStatus = statusMap[eventType] || 'queued';
    const now = new Date();

    const update: Record<string, any> = { status: newStatus, updatedAt: now };

    if (['email.sent', 'email.delivered'].includes(eventType)) update.sentAt = now;
    if (eventType === 'email.delivered') update.deliveredAt = now;
    if (eventType === 'email.opened') update.openedAt = now;
    if (eventType === 'email.clicked') update.clickedAt = now;
    if (eventType === 'email.bounced') update.bouncedAt = now;
    if (eventType === 'email.complained') update.complainedAt = now;
    if (eventType === 'email.bounced') update.error = JSON.stringify(payload.data);

    if (emailId) {
      await EmailLog.update(update, { where: { sendbyteId: emailId } });
    }

    logger.info(`[Webhook] Processed ${eventType} for ${emailId}`);
  } catch (err) {
    logger.error('[Webhook] Processing failed', { err, body });
  }
}
