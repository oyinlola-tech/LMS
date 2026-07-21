import { logger } from '../../core/loggers';
import { queueEnabled, getEmailQueue } from '../../core/queue';
import { transporter, SMTP_FROM_ADDRESS } from './transporter';

const RETRYABLE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH']);

export const sendEmailNow = async ({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }): Promise<void> => {
  if (!to) {
    logger.warn('[Email] Missing recipient address.');
    return;
  }
  if (!transporter) {
    logger.error('[Email] Transporter is null — SMTP credentials may be missing', {
      SMTP_HOST: process.env.SMTP_HOST || '(not set)',
    });
    return;
  }

  const MAX_ATTEMPTS = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      logger.info(`[Email] Sending to ${to} (attempt ${attempt}/${MAX_ATTEMPTS}) subject: "${subject}"`);
      const info = await transporter.sendMail({ from: SMTP_FROM_ADDRESS, to, subject, html, text });
      logger.info(`[Email] Sent successfully to ${to} — messageId: ${info.messageId}`);
      return;
    } catch (error: any) {
      lastError = error;
      const code = error?.code;
      const isRetryable = RETRYABLE_CODES.has(code) || error?.message?.includes('timeout');

      logger.error(`[Email] Attempt ${attempt}/${MAX_ATTEMPTS} failed for ${to}:`, {
        message: error?.message,
        code,
        command: error?.command,
        responseCode: error?.responseCode,
      });

      if (!isRetryable || attempt === MAX_ATTEMPTS) break;

      const delay = 2000 * Math.pow(2, attempt - 1);
      logger.info(`[Email] Retrying in ${delay}ms (transient error: ${code})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const sendEmail = async ({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }): Promise<void> => {
  if (queueEnabled) {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('send-email', { to, subject, html, text });
      return;
    }
  }
  await sendEmailNow({ to, subject, html, text });
};

export const renderTemplate = (templateName: string, templates: Record<string, Function>, params: Record<string, any>) => {
  if (!templates[templateName]) {
    throw new Error(`Template '${templateName}' not found`);
  }
  return templates[templateName](params);
};
