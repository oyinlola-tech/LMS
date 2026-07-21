import { EventEmitter } from 'events';
import { redisEnabled, ensurePublisher, ensureSubscriber } from '../services/redis';
import { logger } from '../core/loggers';

const emitter = new EventEmitter();
const channel = 'learnbridge.notifications';
let redisReady = false;

const initRedisSubscriber = async () => {
  if (!redisEnabled || redisReady) return;
  const sub = await ensureSubscriber();
  if (!sub) return;
  await sub.subscribe(channel, async (message) => {
    try {
      const payload = JSON.parse(message);
      if (!payload || !payload.userId) return;
      emitter.emit('notify', payload);
      const { broadcastNotification: broadcastWs } = await import('./wsHub.util');
      broadcastWs(payload);
    } catch (err) {
      logger.error('[NotificationStream]', (err as Error).message);
    }
  });
  redisReady = true;
};
const clients = new Map();

const addClient = (userId, res) => {
  initRedisSubscriber().catch(() => null);
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);

  const onNotify = (payload) => {
    if (payload.userId !== key) return;
    res.write(`event: notification\ndata: ${JSON.stringify(payload.data)}\n\n`);
  };

  emitter.on('notify', onNotify);

  return () => {
    emitter.off('notify', onNotify);
    const bucket = clients.get(key);
    if (bucket) {
      bucket.delete(res);
      if (bucket.size === 0) clients.delete(key);
    }
  };
};

const broadcastNotification = async (notification: any) => {
  if (!notification || !notification.UserId) return;
  const payload = {
    userId: String(notification.UserId),
    data: {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    },
  };
  if (redisEnabled) {
    const pub = await ensurePublisher();
    if (pub) await pub.publish(channel, JSON.stringify(payload));
    return;
  }
  emitter.emit('notify', payload);
  const { broadcastNotification: broadcastWs } = await import('./wsHub.util');
  broadcastWs(payload);
};

export {
  addClient,
  broadcastNotification,
  initRedisSubscriber,
};
