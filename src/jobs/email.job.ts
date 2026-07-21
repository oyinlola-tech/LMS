import { logger } from '../core/loggers';
import { startEmailWorker } from '../core/queue';
import { sendEmailNow } from '../services/mail';

export function startEmailJob(): void {
  const worker = startEmailWorker(async (job: any) => {
    logger.info(`[EmailJob] Processing job ${job.id} — to: ${job.data.to}`);
    try {
      await sendEmailNow(job.data);
    } catch (err: any) {
      logger.error(`[EmailJob] Failed to send email ${job.id}`, err.message);
      throw err;
    }
  });

  if (worker) {
    logger.info('[EmailJob] Email worker started');
  } else {
    logger.info('[EmailJob] Email queue is disabled — skipping worker');
  }
}
