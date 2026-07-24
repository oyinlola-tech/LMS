import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { addClient } from '../utils/notificationStream.util';
import { listNotificationsQuery } from '../services/notifications/queries/listNotifications.query';
import { createNotificationCommand } from '../services/notifications/commands/createNotification.command';
import { markNotificationReadCommand } from '../services/notifications/commands/markRead.command';
import { markAllNotificationsReadCommand } from '../services/notifications/commands/markAllRead.command';

export const listNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { unread } = request.query as any;
    const notifications = await listNotificationsQuery.execute(request.user!.sub, unread === 'true');
    return ok(reply, notifications, 'Notifications loaded');
  } catch (err: any) {
    return error(reply, 500, 'NOTIFICATIONS_LOAD_FAILED', 'Failed to load notifications');
  }
};

export const streamNotifications = (request: FastifyRequest, reply: FastifyReply) => {
  if (reply.sent) return;
  reply.header('Content-Type', 'text/event-stream');
  reply.header('Cache-Control', 'no-cache');
  reply.header('Connection', 'keep-alive');
  reply.raw.write('event: ready\ndata: {"ok":true}\n\n');
  const remove = addClient(request.user!.sub, reply.raw);
  const keepAlive = setInterval(() => {
    if (reply.raw.writableEnded) { clearInterval(keepAlive); return; }
    reply.raw.write('event: ping\ndata: {"t":' + Date.now() + '}\n\n');
  }, 25000);
  request.raw.on('close', () => { clearInterval(keepAlive); remove(); });
};

export const createNotification = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const notification = await createNotificationCommand.execute(request.user!.sub, (request.body as any) || {});
    return ok(reply, notification, 'Notification created');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'NOTIFICATION_CREATE_FAILED', err.message || 'Failed to create notification');
  }
};

export const markRead = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await markNotificationReadCommand.execute(request.user!.sub, (request.params as any).id);
    return ok(reply, null, 'Notification marked read');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'NOTIFICATION_UPDATE_FAILED', err.message || 'Failed to update notification');
  }
};

export const markAllRead = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await markAllNotificationsReadCommand.execute(request.user!.sub);
    return ok(reply, null, 'All notifications marked read');
  } catch (err: any) {
    return error(reply, 500, 'NOTIFICATIONS_UPDATE_FAILED', 'Failed to update notifications');
  }
};