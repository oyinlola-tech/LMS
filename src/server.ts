import dotenv from 'dotenv';
import { UserRole } from './enums';
import { logger } from './core/loggers';
dotenv.config();

process.on('unhandledRejection', (reason) => {
  logger.error('[Process] Unhandled promise rejection — shutting down', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.error('[Process] Uncaught exception — shutting down', err);
  process.exit(1);
});

import http from 'http';
import { buildApp } from './app';
import { sequelize, User } from './models';
import { hashPassword } from './utils/password.util';
import { sendEmail, templates } from './services/mail';
import { attachWebSocketServer } from './utils/wsHub.util';
import { attachDiscussionWebSocket } from './utils/wsDiscussions.util';
import { initFirebase } from './utils/firebase.util';
import { startEmailJob } from './jobs/email.job';
import { initRedisSubscriber } from './utils/notificationStream.util';

const { PORT, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, APP_NAME, DB_SYNC_ALTER, JWT_SECRET } = process.env;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  logger.error('[Server] JWT_SECRET must be set to a string of at least 32 characters');
  process.exit(1);
}

const ensureSuperAdmin = async () => {
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    logger.warn('[Server] SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set — no super admin will be created');
    return;
  }
  const normalizedEmail = String(SUPER_ADMIN_EMAIL).trim().toLowerCase();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    if (existing.role !== UserRole.SUPER_ADMIN) {
      await existing.update({ role: UserRole.SUPER_ADMIN });
      logger.info('[Server] Upgraded existing user to super admin');
    }
    return;
  }
  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  await User.create({
    fullName: `${APP_NAME} Super Admin`,
    email: normalizedEmail,
    passwordHash,
    role: UserRole.SUPER_ADMIN,
    isEmailVerified: true,
  });
  logger.info(`[Server] Super admin created: ${normalizedEmail}`);
};

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'PORT'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  logger.error(`[Server] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const start = async () => {
  let server: http.Server;
  try {
    try {
      await sequelize.authenticate();
    } catch (dbErr: any) {
      logger.error('[Server] Database connection failed', dbErr.message);
      process.exit(1);
    }

    if (String(DB_SYNC_ALTER) === 'true') {
      logger.warn('[Server] DB_SYNC_ALTER=true — schema will be altered. This is NOT recommended for production.');
    }
    await sequelize.sync({ alter: String(DB_SYNC_ALTER) === 'true' });
    await ensureSuperAdmin();

    const app = await buildApp();
    await app.ready();

    server = http.createServer(app as any);
    attachWebSocketServer(server);
    attachDiscussionWebSocket(server);
    initFirebase();
    initRedisSubscriber().catch(() => null);
    startEmailJob();

    const port = Number(PORT) || 4000;
    server.listen(port, () => {
      logger.info(`${APP_NAME} API running on port ${port}`);
    });
  } catch (err) {
    logger.error('[Server] Failed to start', err);
    process.exit(1);
  }

  const shutdown = (signal: string) => {
    logger.info(`[Server] ${signal} received — shutting down gracefully`);
    if (server) {
      server.close((err) => {
        if (err) {
          logger.error('[Server] Error during shutdown', err);
          process.exit(1);
        }
        logger.info('[Server] HTTP server closed');
        sequelize.close().then(() => {
          logger.info('[Server] Database connection closed');
          process.exit(0);
        }).catch((closeErr) => {
          logger.error('[Server] Error closing database connection', closeErr);
          process.exit(1);
        });
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();