import cluster from 'cluster';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { User, MessageThread, Message } from '../models';
import { logger } from '../core/loggers';

const { JWT_SECRET } = process.env;
const hasValidJwtSecret = typeof JWT_SECRET === 'string' && JWT_SECRET.trim().length > 0;
if (!hasValidJwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

const normalizeUserId = (value) => {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const getCanonicalUserPair = (userId1, userId2) => {
  const userId1Num = Number(userId1);
  const userId2Num = Number(userId2);
  if (!Number.isFinite(userId1Num) || !Number.isFinite(userId2Num)) {
    return null;
  }
  return userId1Num < userId2Num
    ? { userAId: String(userId1), userBId: String(userId2) }
    : { userAId: String(userId2), userBId: String(userId1) };
};


const validateIncomingMessage = (raw, socket, maxBytes, rateLimiter) => {
  const rawText = Buffer.isBuffer(raw) ? raw.toString() : String(raw);
  const rawSize = Buffer.byteLength(rawText, 'utf8');
  if (rawSize > maxBytes) {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'MESSAGE_TOO_LARGE', message: 'Message too large.' },
    }));
    return null;
  }
  if (rateLimiter(socket)) {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'RATE_LIMITED', message: 'Too many messages. Slow down.' },
    }));
    return null;
  }
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(rawText);
  } catch (parseErr) {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'INVALID_JSON', message: 'Invalid JSON payload.' },
    }));
    return null;
  }
  if (!parsedPayload || parsedPayload.type !== 'message') {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'INVALID_MESSAGE_TYPE', message: 'Unsupported message type.' },
    }));
    return null;
  }
  return parsedPayload;
};


const validateMessageContext = (parsedPayload, socket) => {
  const normalizedSocketUserId = normalizeUserId(socket.userId);
  if (!normalizedSocketUserId) {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'UNAUTHORIZED', message: 'Invalid authenticated user.' },
    }));
    return null;
  }
  const { threadId, participantId, body } = parsedPayload.data || {};
  const normalizedBody = typeof body === 'string' ? body.trim() : '';
  if (!normalizedBody) {
    socket.send(JSON.stringify({
      type: 'error',
      error: { code: 'INVALID_MESSAGE_BODY', message: 'Message body is required.' },
    }));
    return null;
  }
  return {
    messageType: parsedPayload.type,
    threadId,
    participantId,
    normalizedBody,
    normalizedSocketUserId,
  };
};

const WS_MAX_MESSAGE_BYTES = Number(process.env.WS_MAX_MESSAGE_BYTES) || 4096;
const WS_MAX_MESSAGES_PER_MINUTE = Number(process.env.WS_MAX_MESSAGES_PER_MINUTE) || 30;
const WS_RATE_WINDOW_MS = 60 * 1000;

const isMultiProcessRuntime = Boolean(
  cluster.isWorker || process.env.NODE_APP_INSTANCE || process.env.pm_id
);
const allowInMemoryMultiProcess =
  String(process.env.WS_ALLOW_IN_MEMORY_MULTIPROCESS || '').toLowerCase() === 'true';

if (isMultiProcessRuntime && !allowInMemoryMultiProcess) {
  throw new Error(
    'wsHub uses in-memory WebSocket state and is not safe for multi-process deployments. ' +
      'This module does not include a shared pub/sub adapter; implement external fan-out ' +
      '(for example, Redis pub/sub) before running multiple processes, or set ' +
      'WS_ALLOW_IN_MEMORY_MULTIPROCESS=true to bypass this check.'
  );
}

const clients = new Map();
const messageClients = new Map();
let wssNotifications = null;
let wssMessages = null;

const registerClient = (userId, socket) => {
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(socket);
};

const removeClient = (userId, socket) => {
  const key = String(userId);
  const userSockets = clients.get(key);
  if (!userSockets) return;
  userSockets.delete(socket);
  if (userSockets.size === 0) clients.delete(key);
};

const broadcastNotification = (notification) => {
  if (!notification) return;
  const userId = notification.UserId || notification.userId;
  const notificationPayload = notification.data || {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
  if (!userId) return;
  const key = String(userId);
  const userSockets = clients.get(key);
  if (!userSockets || userSockets.size === 0) return;
  const payload = JSON.stringify({
    type: 'notification',
    data: notificationPayload,
  });
  userSockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
};

const registerMessageClient = (userId, socket) => {
  const key = String(userId);
  if (!messageClients.has(key)) messageClients.set(key, new Set());
  messageClients.get(key).add(socket);
};

const removeMessageClient = (userId, socket) => {
  const key = String(userId);
  const socketSet = messageClients.get(key);
  if (!socketSet) return;
  socketSet.delete(socket);
  if (socketSet.size === 0) messageClients.delete(key);
};

/**
 * Broadcasts a chat message payload to all currently connected websocket clients
 * for each recipient user ID.
 *
 * Validates required fields before sending. If validation fails, the function
 * logs a warning and returns without sending anything.
 *
 * @param {Object} params - Message delivery parameters.
 * @param {string|number} params.threadId - Conversation/thread identifier.
 * @param {string|number} params.senderId - User ID of the sender.
 * @param {Array<string|number>} params.recipientIds - Recipient user IDs whose
 * open sockets should receive the message.
 * @param {string} params.body - Message body text (must be non-empty after trim).
 * @param {string|Date|number} params.createdAt - Message creation timestamp.
 *
 * @returns {void}
 *
 * @sideEffects Reads from the in-memory `messageClients` map and calls
 * `socket.send(...)` on sockets with `readyState === WebSocket.OPEN`.
 * Assumes `messageClients` contains sets of websocket connections keyed by user ID.
 */
const sendChatMessageToRecipients = ({ threadId, senderId, recipientIds, body, createdAt }) => {
  if (!threadId) {
    logger.warn('sendChatMessageToRecipients: missing threadId');
    return;
  }
  if (senderId == null) {
    logger.warn('sendChatMessageToRecipients: missing senderId', { threadId });
    return;
  }
  if (!Array.isArray(recipientIds)) {
    logger.warn('sendChatMessageToRecipients: recipientIds is not an array', { threadId, senderId });
    return;
  }
  if (typeof body !== 'string') {
    logger.warn('sendChatMessageToRecipients: body is not a string', { threadId, senderId });
    return;
  }
  if (body.trim().length === 0) {
    logger.warn('sendChatMessageToRecipients: body is empty', { threadId, senderId });
    return;
  }
  if (createdAt == null) {
    logger.warn('sendChatMessageToRecipients: missing createdAt', { threadId, senderId });
    return;
  }
  const payload = JSON.stringify({
    type: 'message',
    data: { threadId, senderId, body, createdAt },
  });
  recipientIds.forEach((userId) => {
    const userSockets = messageClients.get(String(userId));
    if (!userSockets || userSockets.size === 0) return;
    userSockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    });
  });
};

const parseBearerTokenFromProtocolParts = (parts) => {
  if (!parts.length) return null;
  const bearerIndex = parts.findIndex((p) => p.toLowerCase() === 'bearer');
  if (bearerIndex >= 0 && parts[bearerIndex + 1]) return parts[bearerIndex + 1];
  const bearerToken = parts.find((p) => p.toLowerCase().startsWith('bearer '));
  if (bearerToken) return bearerToken.slice(7).trim();
  return null;
};

const parseTokenFromProtocols = (protocolHeader) => {
  if (!protocolHeader) return null;
  const parts = String(protocolHeader).split(',').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const bearerToken = parseBearerTokenFromProtocolParts(parts);
  if (bearerToken) return bearerToken;
  return parts.length === 1 ? parts[0] : null;
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const protocolToken = parseTokenFromProtocols(req.headers['sec-websocket-protocol']);
  if (protocolToken) return protocolToken;
  const url = new URL(req.url, 'http://localhost');
  return url.searchParams.get('token');
};

const isRateLimited = (socket) => {
  const now = Date.now();
  if (!socket.rateLimitState) {
    socket.rateLimitState = { windowStart: now, count: 0 };
  }
  const state = socket.rateLimitState;
  if (now - state.windowStart >= WS_RATE_WINDOW_MS) {
    state.windowStart = now;
    state.count = 0;
  }
  if (state.count >= WS_MAX_MESSAGES_PER_MINUTE) {
    return true;
  }
  state.count += 1;
  return false;
};

/**
 * Creates and attaches notification and message WebSocket servers to the given HTTP server.
 *
 * If existing WebSocket servers are already attached to the same server, they are reused.
 * If existing servers are attached to a different server, they are closed and replaced.
 *
 * @param {import('http').Server|import('https').Server} server - The HTTP/S server to attach WebSocket endpoints to.
 * @returns {{notifications: import('ws').WebSocketServer, messages: import('ws').WebSocketServer}} Object containing the notifications and messages WebSocket servers.
 *
 * @sideEffects May close previously created WebSocket servers and mutates module-scoped
 * `wssNotifications` and `wssMessages` references.
 */
const attachWebSocketServer = (server) => {
  const safeCloseWebSocketServer = (wsServer, label) => {
    try {
      wsServer.close();
    } catch (err) {
      logger.warn(`Failed to close ${label} WebSocket server:`, err);
    }
  };

  if (wssNotifications && wssMessages) {
    const notificationsHasOptions = wssNotifications.options && wssNotifications.options.server;
    const messagesHasOptions = wssMessages.options && wssMessages.options.server;
    const notificationsSameServer = notificationsHasOptions && wssNotifications.options.server === server;
    const messagesSameServer = messagesHasOptions && wssMessages.options.server === server;
    const sameServer = notificationsSameServer && messagesSameServer;
    if (sameServer) {
      return { notifications: wssNotifications, messages: wssMessages };
    }
    safeCloseWebSocketServer(wssNotifications, 'notifications');
    safeCloseWebSocketServer(wssMessages, 'messages');
    wssNotifications = null;
    wssMessages = null;
  }
  wssNotifications = new WebSocketServer({ server, path: '/ws/notifications' });
  wssMessages = new WebSocketServer({ server, path: '/ws/messages' });

  wssNotifications.on('connection', async (socket, req) => {
    try {
      const token = extractToken(req);
      if (!token) {
        socket.close(1008, 'Unauthorized');
        return;
      }
      const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      const user = await User.findByPk(payload.sub as string, { attributes: ['id', 'status'] });
      if (!user || user.status !== 'active') {
        socket.close(1008, 'Account inactive');
        return;
      }
      registerClient(user.id, socket);

      socket.send(JSON.stringify({ type: 'ready', data: { ok: true } }));

      socket.on('error', (socketErr) => {
        logger.warn(`[WS:notifications] Socket error for user ${user.id}: ${socketErr?.message}`);
        removeClient(user.id, socket);
      });

      socket.on('close', () => {
        removeClient(user.id, socket);
      });
    } catch (err) {
      const isJwtError = err
        && (
          err.name === 'TokenExpiredError'
          || err.name === 'JsonWebTokenError'
          || err.name === 'NotBeforeError'
        );
      if (isJwtError) {
        logger.warn(`WebSocket authentication failed: ${err.name} ${err.message}`);
      } else {
        logger.error('WebSocket connection setup failed', err);
      }
      socket.close(1008, 'Unauthorized');
    }
  });

  wssMessages.on('connection', async (socket, req) => {
    try {
      const token = extractToken(req);
      if (!token) {
        socket.close(1008, 'Unauthorized');
        return;
      }
      const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      const user = await User.findByPk(payload.sub as string, { attributes: ['id', 'status'] });
      if (!user || user.status !== 'active') {
        socket.close(1008, 'Account inactive');
        return;
      }
      socket.userId = user.id;
      registerMessageClient(user.id, socket);

      socket.send(JSON.stringify({ type: 'ready', data: { ok: true } }));

      socket.on('message', async (raw) => {
        let threadId;
        let participantId;
        let messageType;
        try {
          const parsedPayload = validateIncomingMessage(raw, socket, WS_MAX_MESSAGE_BYTES, isRateLimited);
          if (!parsedPayload) return;
          const messageContext = validateMessageContext(parsedPayload, socket);
          if (!messageContext) return;
          ({ messageType, threadId, participantId } = messageContext);
          const { normalizedBody, normalizedSocketUserId } = messageContext;
          if (!threadId && !participantId) {
            socket.send(JSON.stringify({
              type: 'error',
              error: { code: 'MISSING_MESSAGE_TARGET', message: 'Either threadId or participantId is required.' },
            }));
            return;
          }

          let thread = null;
          const messageTimestamp = new Date();
          if (threadId) {
            try {
              thread = await MessageThread.findByPk(threadId);
            } catch (dbError) {
              logger.error('Database error while loading thread by id', {
                threadId,
                socketUserId: socket.userId,
                error: dbError?.message || dbError,
              });
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'DB_THREAD_LOOKUP_FAILED',
                  message: 'Unable to load thread at the moment. Please try again.',
                },
              }));
              return;
            }
            if (!thread) {
              socket.send(JSON.stringify({
                type: 'error',
                error: { code: 'THREAD_NOT_FOUND', message: 'Thread not found.' },
              }));
              return;
            }
            const normalizedUserAId = normalizeUserId(thread.userAId);
            const normalizedUserBId = normalizeUserId(thread.userBId);
            const isAllowedThreadParticipant = (
              normalizedSocketUserId === normalizedUserAId
              || normalizedSocketUserId === normalizedUserBId
            );
            if (!isAllowedThreadParticipant) {
              socket.send(JSON.stringify({
                type: 'error',
                error: { code: 'FORBIDDEN_THREAD_ACCESS', message: 'You are not allowed to post to this thread.' },
              }));
              return;
            }
          } else {
            const normalizedParticipantId = normalizeUserId(participantId);
            if (!normalizedParticipantId) {
              socket.send(JSON.stringify({
                type: 'error',
                error: { code: 'INVALID_PARTICIPANT_ID', message: 'participantId is required.' },
              }));
              return;
            }
            if (normalizedParticipantId === normalizedSocketUserId) {
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'SELF_MESSAGE_NOT_ALLOWED',
                  message: 'You cannot send a message to yourself.',
                },
              }));
              return;
            }
            const participant = await User.findByPk(normalizedParticipantId, { attributes: ['id', 'status'] });
            if (!participant) {
              socket.send(JSON.stringify({
                type: 'error',
                error: { code: 'PARTICIPANT_NOT_FOUND', message: 'Participant not found.' },
              }));
              return;
            }
            if (participant.status !== 'active') {
              socket.send(JSON.stringify({
                type: 'error',
                error: { code: 'PARTICIPANT_INACTIVE', message: 'Participant is not active.' },
              }));
              return;
            }
            try {
              const canonicalPair = getCanonicalUserPair(normalizedSocketUserId, normalizedParticipantId);
              if (!canonicalPair) {
                socket.send(JSON.stringify({
                  type: 'error',
                  error: {
                    code: 'INVALID_USER_ID_FORMAT',
                    message: 'User identifiers must be numeric.',
                  },
                }));
                return;
              }
              thread = await MessageThread.findOne({
                where: {
                  userAId: canonicalPair.userAId,
                  userBId: canonicalPair.userBId,
                },
              });
            } catch (dbError) {
              logger.error('Database error while loading thread for participants', {
                socketUserId: socket.userId,
                participantId: normalizedParticipantId,
                error: dbError?.message || dbError,
              });
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'DB_THREAD_LOOKUP_FAILED',
                  message: 'Unable to load thread at the moment. Please try again.',
                },
              }));
              return;
            }

            if (!thread) {
              const canonicalPair = getCanonicalUserPair(normalizedSocketUserId, normalizedParticipantId);
              if (!canonicalPair) {
                socket.send(JSON.stringify({
                  type: 'error',
                  error: {
                    code: 'INVALID_USER_ID_FORMAT',
                    message: 'User identifiers must be numeric.',
                  },
                }));
                return;
              }
              try {
                thread = await MessageThread.create({
                  userAId: canonicalPair.userAId,
                  userBId: canonicalPair.userBId,
                  subject: parsedPayload.data?.subject || null,
                  lastMessageAt: messageTimestamp.toISOString(),
                });
              } catch (threadCreateErr) {
                if (threadCreateErr?.name === 'SequelizeUniqueConstraintError') {
                  try {
                    thread = await MessageThread.findOne({
                      where: {
                        userAId: canonicalPair.userAId,
                        userBId: canonicalPair.userBId,
                      },
                    });
                  } catch (threadRecoveryLookupErr) {
                    logger.error('Database error while recovering thread after unique constraint conflict', {
                      socketUserId: socket.userId,
                      participantId: normalizedParticipantId,
                      userAId: canonicalPair.userAId,
                      userBId: canonicalPair.userBId,
                      error: threadRecoveryLookupErr?.message || threadRecoveryLookupErr,
                    });
                    throw threadRecoveryLookupErr;
                  }
                  if (!thread) {
                    logger.warn('Unique constraint conflict occurred but no thread was found during recovery lookup', {
                      socketUserId: socket.userId,
                      participantId: normalizedParticipantId,
                      userAId: canonicalPair.userAId,
                      userBId: canonicalPair.userBId,
                    });
                    throw new Error('Failed to recover message thread after unique constraint conflict');
                  }
                } else {
                  throw threadCreateErr;
                }
              }
            }
            if (!thread) {
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'THREAD_CREATE_FAILED',
                  message: 'Failed to create or load message thread',
                },
              }));
              return;
            }
          }

          try {
            await Message.create({
              MessageThreadId: thread.id,
              senderId: normalizedSocketUserId,
              body: normalizedBody,
            });
          } catch (createErr) {
            logger.warn('Failed to create message', {
              userId: normalizeUserId(socket.userId),
              threadId: thread.id,
              errorName: createErr?.name,
              errorMessage: createErr?.message,
            });
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'MESSAGE_CREATE_FAILED',
                  message: 'Failed to create message',
                },
              }));
            }
            return;
          }
          try {
            await thread.update({ lastMessageAt: messageTimestamp.toISOString() });
          } catch (saveErr) {
            logger.warn('Failed to save thread', {
              userId: normalizeUserId(socket.userId),
              threadId: thread.id,
              errorName: saveErr?.name,
              errorMessage: saveErr?.message,
            });
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'error',
                error: {
                  code: 'THREAD_SAVE_FAILED',
                  message: 'Failed to save thread',
                },
              }));
            }
            return;
          }

          sendChatMessageToRecipients({
            threadId: thread.id,
            senderId: normalizedSocketUserId,
            recipientIds: [thread.userAId, thread.userBId],
            body: normalizedBody,
            createdAt: messageTimestamp,
          });
        } catch (err) {
          logger.warn('Failed to handle incoming WebSocket chat message', {
            userId: normalizeUserId(socket.userId),
            threadId,
            participantId,
            messageType,
            errorName: err?.name,
            errorMessage: err?.message,
          });
        }
      });

      socket.on('error', (socketErr) => {
        logger.warn(`[WS:messages] Socket error for user ${user.id}: ${socketErr?.message}`);
        removeMessageClient(user.id, socket);
      });

      socket.on('close', () => {
        removeMessageClient(user.id, socket);
      });
    } catch (err) {
      const isJwtError = err
        && (
          err.name === 'TokenExpiredError'
          || err.name === 'JsonWebTokenError'
          || err.name === 'NotBeforeError'
        );
      if (isJwtError) {
        logger.warn(`WebSocket authentication failed: ${err.name} ${err.message}`);
      } else {
        logger.error('WebSocket connection setup failed', err);
      }
      socket.close(1008, 'Unauthorized');
    }
  });

  return { notifications: wssNotifications, messages: wssMessages };
};

export { attachWebSocketServer, broadcastNotification, sendChatMessageToRecipients };
