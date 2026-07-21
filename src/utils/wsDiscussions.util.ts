import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { User, GroupMember, DiscussionMessage, DiscussionGroup } from '../models';
import { logger } from '../core/loggers';
import { broadcastNotification } from './wsHub.util';

const { JWT_SECRET } = process.env;

const groupClients = new Map();

const getGroupKey = (groupId) => `group:${groupId}`;

const addGroupClient = (groupId, userId, socket) => {
  const key = getGroupKey(groupId);
  if (!groupClients.has(key)) groupClients.set(key, new Map());
  const group = groupClients.get(key);
  if (!group.has(userId)) group.set(userId, new Set());
  group.get(userId).add(socket);
};

const removeGroupClient = (groupId, userId, socket) => {
  const key = getGroupKey(groupId);
  const group = groupClients.get(key);
  if (!group) return;
  const userSockets = group.get(userId);
  if (!userSockets) return;
  userSockets.delete(socket);
  if (userSockets.size === 0) group.delete(userId);
  if (group.size === 0) groupClients.delete(key);
};

const broadcastToGroup = (groupId, payload, excludeUserId) => {
  const key = getGroupKey(groupId);
  const group = groupClients.get(key);
  if (!group) return;
  const data = JSON.stringify(payload);
  group.forEach((sockets, userId) => {
    if (userId === excludeUserId) return;
    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(data);
    });
  });
};

const attachDiscussionWebSocket = (server) => {
  const wss = new WebSocket.Server({ server, path: '/ws/discussions' });

  wss.on('connection', async (socket, req) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token') || (() => {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
        return null;
      })();

      if (!token) {
        socket.close(1008, 'Unauthorized');
        return;
      }

      const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      const user = await User.findByPk(payload.sub as string, { attributes: ['id', 'fullName', 'avatarUrl', 'status'] });
      if (!user || user.status !== 'active') {
        socket.close(1008, 'Account inactive');
        return;
      }

      let currentGroupId = null;

      socket.send(JSON.stringify({ type: 'ready', data: { ok: true } }));

      socket.on('message', async (raw) => {
        try {
          const text = Buffer.isBuffer(raw) ? raw.toString() : String(raw);
          const msg = JSON.parse(text);

          if (msg.type === 'join' && msg.groupId) {
            const membership = await GroupMember.findOne({ where: { groupId: msg.groupId, userId: user.id } });
            if (!membership) {
              socket.send(JSON.stringify({ type: 'error', error: { code: 'NOT_MEMBER', message: 'You are not a member of this group' } }));
              return;
            }
            if (currentGroupId) removeGroupClient(currentGroupId, user.id, socket);
            currentGroupId = msg.groupId;
            addGroupClient(currentGroupId, user.id, socket);
            socket.send(JSON.stringify({ type: 'joined', data: { groupId: currentGroupId } }));
            return;
          }

          if (msg.type === 'leave' && currentGroupId) {
            removeGroupClient(currentGroupId, user.id, socket);
            currentGroupId = null;
            return;
          }

          if (msg.type === 'message' && currentGroupId) {
            const content = (msg.data && msg.data.content || '').trim();
            if (!content || content.length > 2000) {
              socket.send(JSON.stringify({ type: 'error', error: { code: 'INVALID_MESSAGE', message: 'Message must be between 1 and 2000 characters' } }));
              return;
            }

            const saved = await DiscussionMessage.create({
              groupId: currentGroupId,
              authorId: user.id,
              content,
            });

            const messagePayload = {
              type: 'message',
              data: {
                id: saved.id,
                groupId: currentGroupId,
                authorId: user.id,
                authorName: user.fullName,
                authorAvatar: user.avatarUrl,
                content,
                createdAt: saved.createdAt,
              },
            };

            socket.send(JSON.stringify(messagePayload));

            broadcastToGroup(currentGroupId, messagePayload, user.id);
            return;
          }
        } catch (err) {
          logger.warn('[WS:discussions] Message handling error', err);
          socket.send(JSON.stringify({ type: 'error', error: { code: 'INVALID', message: 'Invalid message' } }));
        }
      });

      socket.on('close', () => {
        if (currentGroupId) removeGroupClient(currentGroupId, user.id, socket);
      });

      socket.on('error', () => {
        if (currentGroupId) removeGroupClient(currentGroupId, user.id, socket);
      });
    } catch (err) {
      const isJwtError = err && (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError');
      if (isJwtError) logger.warn('[WS:discussions] Auth failed:', err.message);
      else logger.error('[WS:discussions] Connection error', err);
      socket.close(1008, 'Unauthorized');
    }
  });

  return wss;
};

export { attachDiscussionWebSocket, broadcastToGroup };
