import nodemailer from 'nodemailer';
import { logger } from '../../core/loggers';

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const defaultPort = SMTP_PORT
  ? Number(SMTP_PORT)
  : (String(SMTP_SECURE).toLowerCase() === 'true' ? 465 : 587);

if (SMTP_HOST) {
  logger.info('[Email] SMTP config loaded:', {
    host: SMTP_HOST,
    port: defaultPort,
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    hasAuth: Boolean(SMTP_USER && SMTP_PASS),
    from: SMTP_FROM,
  });
}

export const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: defaultPort,
      secure: String(SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: false, family: 4 },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    })
  : null;

if (transporter) {
  transporter.verify((err: any) => {
    if (err) {
      logger.error('[Email] SMTP connection verification failed:', {
        message: err.message,
        code: err.code,
        host: SMTP_HOST,
        port: defaultPort,
      });
    } else {
      logger.info('[Email] SMTP connection verified — ready to send mail');
    }
  });
}

export const SMTP_FROM_ADDRESS = SMTP_FROM;
