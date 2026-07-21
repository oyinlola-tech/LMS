import { createClient } from 'redis';
import { logger } from '../../core/loggers';

const redisUrl = process.env.REDIS_URL;
const redisEnabled = String(process.env.REDIS_ENABLED || 'false') === 'true';

let publisher = null;
let publisherInitPromise = null;
let subscriber = null;

const getSanitizedRedisUrl = (url) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch (_) {
    return '[invalid REDIS_URL]';
  }
};

const ensurePublisher = async () => {
  if (!redisEnabled) return null;
  if (publisher) return publisher;
  if (publisherInitPromise) return publisherInitPromise;

  publisherInitPromise = (async () => {
    const client = createClient({ url: redisUrl });
    client.on('error', (err) => {
      logger.error('[Redis:pub] Redis publisher error', {
        scope: 'publisher',
        timestamp: new Date().toISOString(),
        redisUrl: getSanitizedRedisUrl(redisUrl),
        err,
      });
    });

    publisher = client;

    try {
      await client.connect();
      return client;
    } catch (err) {
      logger.error('[Redis:pub] Failed to connect', {
        scope: 'publisher',
        timestamp: new Date().toISOString(),
        redisUrl: getSanitizedRedisUrl(redisUrl),
        err: err && err.message ? err.message : err,
      });
      try { await client.quit(); } catch (cleanupErr) {
        logger.debug('[Redis:pub] Cleanup after failed connect encountered an error', {
          scope: 'publisher',
          timestamp: new Date().toISOString(),
          redisUrl: getSanitizedRedisUrl(redisUrl),
          err: cleanupErr && cleanupErr.message ? cleanupErr.message : cleanupErr,
        });
      }
      if (publisher === client) publisher = null;
      return null;
    } finally {
      publisherInitPromise = null;
    }
  })();

  return publisherInitPromise;
};

const ensureSubscriber = async () => {
  if (!redisEnabled) return null;
  if (subscriber) return subscriber;
  subscriber = createClient({ url: redisUrl });
  subscriber.on('error', (err) => {
    logger.error('[Redis:sub] Redis subscriber error', {
      scope: 'subscriber',
      timestamp: new Date().toISOString(),
      redisUrl: getSanitizedRedisUrl(redisUrl),
      err,
    });
  });
  try {
    await subscriber.connect();
    return subscriber;
  } catch (err) {
    logger.error('[Redis:sub] Failed to connect', {
      scope: 'subscriber',
      timestamp: new Date().toISOString(),
      redisUrl: getSanitizedRedisUrl(redisUrl),
      err: err && err.message ? err.message : err,
    });
    try { subscriber.disconnect(); } catch (cleanupErr) {
      logger.debug('[Redis:sub] Failed to disconnect subscriber during cleanup', {
        scope: 'subscriber',
        timestamp: new Date().toISOString(),
        redisUrl: getSanitizedRedisUrl(redisUrl),
        err: cleanupErr && cleanupErr.message ? cleanupErr.message : cleanupErr,
      });
    }
    subscriber = null;
    return null;
  }
};

export {
  redisEnabled,
  ensurePublisher,
  ensureSubscriber,
};
