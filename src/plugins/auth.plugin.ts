import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { ROLE_HIERARCHY } from '../enums/user.enum';

export interface AuthUser {
  sub: string;
  role: string;
  email?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAtLeastRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorateRequest('user', undefined);

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', details: null } });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', details: null } });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      reply.status(500).send({ error: { code: 'CONFIG_ERROR', message: 'JWT secret not configured', details: null } });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      reply.status(401).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token', details: null } });
      return;
    }

    const user = await userRepository.findByIdWithStatus(decoded.sub);
    if (!user) {
      reply.status(401).send({ error: { code: 'USER_NOT_FOUND', message: 'User not found', details: null } });
      return;
    }
    if (user.status === 'banned') {
      reply.status(403).send({ error: { code: 'BANNED', message: 'Account is banned', details: null } });
      return;
    }

    request.user = { sub: decoded.sub, role: decoded.role, email: decoded.email };
  });

  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return;

    const token = authHeader.split(' ')[1];
    if (!token) return;

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await userRepository.findByIdWithStatus(decoded.sub);
      if (user && user.status !== 'banned') {
        request.user = { sub: decoded.sub, role: decoded.role, email: decoded.email };
      }
    } catch {
    }
  });

  fastify.decorate('requireRole', (role: string) => {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      if (!request.user) {
        reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', details: null } });
        return;
      }
      if (request.user.role !== role) {
        reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Forbidden', details: null } });
        return;
      }
    };
  });

  fastify.decorate('requireAtLeastRole', (minRole: string) => {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      if (!request.user) {
        reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', details: null } });
        return;
      }
      const userLevel = ROLE_HIERARCHY[request.user.role];
      const requiredLevel = ROLE_HIERARCHY[minRole];
      if (userLevel === undefined || requiredLevel === undefined || userLevel < requiredLevel) {
        reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions', details: null } });
        return;
      }
    };
  });
}

export default fp(authPlugin, { name: 'auth' });
