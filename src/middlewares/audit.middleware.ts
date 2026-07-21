import type { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../core/loggers';

export async function requestLogger(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const { method, url, ip } = request;
  const userId = request.user?.sub || 'anonymous';
  logger.info(`[${method}] ${url} — user: ${userId} — ip: ${ip}`);
}
