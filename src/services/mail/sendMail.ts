import { logger } from '../../core/loggers';
import { queueEnabled, getEmailQueue } from '../../core/queue';
import { transporter, SMTP_FROM_ADDRESS } from './transporter';
import { EmailLog } from '../../models';

const RETRYABLE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH']);

export const sendEmailNow = async ({ to, subject, html, text, tags }: { to: string; subject: string; html: string; text: string; tags?: string[] }): Promise<void> => {
  if (!to) {
    logger.warn('[Email] Missing recipient address.');
    return;
  }
  if (!transporter) {
    logger.error('[Email] Transporter is null — SENDBYTE_API_KEY may be missing');
    return;
  }

  const MAX_ATTEMPTS = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      logger.info(`[Email] Sending to ${to} (attempt ${attempt}/${MAX_ATTEMPTS}) subject: "${subject}"`);
      const info = await transporter.sendMail({ from: SMTP_FROM_ADDRESS, to, subject, html, text });
      logger.info(`[Email] Sent successfully to ${to} — messageId: ${info.messageId}`);

      EmailLog.create({
        sendbyteId: info.messageId || null,
        to,
        subject,
        status: 'sent',
        tags: tags ? JSON.stringify(tags) : null,
      }).catch((err) => logger.warn('[Email] Failed to create email log', err));

      return;
    } catch (error: any) {
      lastError = error;
      const code = error?.code || error?.statusCode;
      const isRetryable = RETRYABLE_CODES.has(code) || error?.message?.includes('timeout') || (typeof code === 'number' && code >= 500 && code < 600);

      logger.error(`[Email] Attempt ${attempt}/${MAX_ATTEMPTS} failed for ${to}:`, {
        message: error?.message,
        code,
      });

      if (!isRetryable || attempt === MAX_ATTEMPTS) break;

      const delay = 2000 * Math.pow(2, attempt - 1);
      logger.info(`[Email] Retrying in ${delay}ms (transient error: ${code})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  EmailLog.create({
    to,
    subject,
    status: 'failed',
    error: lastError?.message || 'Unknown error',
  }).catch((err) => logger.warn('[Email] Failed to create error email log', err));

  throw lastError;
};

export const sendEmail = async ({ to, subject, html, text, tags }: { to: string; subject: string; html: string; text: string; tags?: string[] }): Promise<void> => {
  if (queueEnabled) {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('send-email', { to, subject, html, text, tags });
      return;
    }
  }
  await sendEmailNow({ to, subject, html, text, tags });
};

