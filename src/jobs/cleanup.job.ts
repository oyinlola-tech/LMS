import { logger } from '../core/loggers';
import { Op } from 'sequelize';
import { PasswordReset, Otp } from '../models';

const CLEANUP_INTERVAL_MS = 3600000;

async function cleanExpiredTokens(): Promise<void> {
  const now = new Date();
  const deletedPasswordResets = await PasswordReset.destroy({ where: { expiresAt: { [Op.lt]: now } } });
  const deletedOtps = await Otp.destroy({ where: { expiresAt: { [Op.lt]: now } } });
  if (deletedPasswordResets > 0 || deletedOtps > 0) {
    logger.info(`[Cleanup] Removed ${deletedPasswordResets} expired password resets and ${deletedOtps} expired OTPs`);
  }
}

export function startCleanupJob(): void {
  logger.info('[CleanupJob] Starting periodic cleanup (every 1h)');
  cleanExpiredTokens();
  setInterval(() => {
    cleanExpiredTokens().catch((err) => {
      logger.error('[CleanupJob] Cleanup failed', err.message);
    });
  }, CLEANUP_INTERVAL_MS);
}
