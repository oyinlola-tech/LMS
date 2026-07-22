import { SendByte } from '@sendbyte/node';
import { logger } from '../../core/loggers';

const apiKey = process.env.SENDBYTE_API_KEY;
const fromAddress = process.env.MAIL_FROM || 'LearnBridge <noreply@learnbridge.com>';

let client: SendByte | null = null;

if (apiKey) {
  client = new SendByte(apiKey);
  logger.info('[Email] SendByte client initialized');
} else {
  logger.warn('[Email] SENDBYTE_API_KEY not set — email sending disabled');
}

export const transporter = client
  ? {
      sendMail: async ({ from, to, subject, html, text }: { from: string; to: string; subject: string; html: string; text: string }) => {
        const { id } = await client!.emails.send({ from, to, subject, html });
        return { messageId: id };
      },
    }
  : null;

export const SMTP_FROM_ADDRESS = fromAddress;
