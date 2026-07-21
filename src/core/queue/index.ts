import { Queue, Worker } from 'bullmq';

const queueEnabled = String(process.env.EMAIL_QUEUE_ENABLED || 'false') === 'true';
const queueName = process.env.EMAIL_QUEUE_NAME || 'email-jobs';

const parseRedisUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const isTls = parsed.protocol === 'rediss:' || String(process.env.REDIS_TLS || 'false') === 'true';
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: isTls ? {} : undefined,
    };
  } catch (_) {
    return null;
  }
};

const redisFromUrl = parseRedisUrl(process.env.REDIS_URL);

const queueConnectionConfig = queueEnabled
  ? {
      connection: {
        host: redisFromUrl?.host || process.env.REDIS_HOST || '127.0.0.1',
        port: redisFromUrl?.port || Number(process.env.REDIS_PORT || 6379),
        password: redisFromUrl?.password || process.env.REDIS_PASSWORD || undefined,
        username: redisFromUrl?.username || process.env.REDIS_USERNAME || undefined,
        tls: redisFromUrl?.tls || (String(process.env.REDIS_TLS || 'false') === 'true' ? {} : undefined),
      },
    }
  : null;

let emailQueue = null;

const getEmailQueue = () => {
  if (!queueEnabled) return null;
  if (!emailQueue) emailQueue = new Queue(queueName, queueConnectionConfig);
  return emailQueue;
};

const startEmailWorker = (handler) => {
  if (!queueEnabled) return null;
  return new Worker(queueName, handler, queueConnectionConfig);
};

export {
  queueEnabled,
  queueName,
  getEmailQueue,
  startEmailWorker,
};
