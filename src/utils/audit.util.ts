import { logger } from '../core/loggers';
import { AdminAuditLog } from '../models';

const windowMs = Number(process.env.AUDIT_LOG_WINDOW_MS || 60000);
const limit = Number(process.env.AUDIT_LOG_RATE_LIMIT || 60);
const failureThreshold = Number(process.env.AUDIT_LOG_FAILURE_THRESHOLD || 5);
const cooldownMs = Number(process.env.AUDIT_LOG_COOLDOWN_MS || 120000);

let windowStart = Date.now();
let windowCount = 0;
let failureCount = 0;
let circuitOpenUntil = 0;

const canWrite = () => {
  const now = Date.now();
  if (now < circuitOpenUntil) return false;
  if (now - windowStart > windowMs) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= limit) return false;
  windowCount += 1;
  return true;
};

const onFailure = () => {
  failureCount += 1;
  if (failureCount >= failureThreshold) {
    circuitOpenUntil = Date.now() + cooldownMs;
    failureCount = 0;
  }
};

const logSecurityEvent = async ({ title, content, meta, actorId }) => {
  try {
    if (!canWrite()) return;
    await AdminAuditLog.create({
      actorId: actorId || null,
      title,
      content,
      status: 'security',
      meta: meta || null,
    });
  } catch (err) {
    onFailure();
    logger.error('[AuditLog]', err.message);
  }
};

export { logSecurityEvent };
