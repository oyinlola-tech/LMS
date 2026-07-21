import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const server = request.server;
  if (!server.authenticate) {
    reply.status(500).send({ error: { code: 'CONFIG_ERROR', message: 'Auth plugin not registered', details: null } });
    return;
  }
  return server.authenticate(request, reply);
}

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const server = request.server;
  if (!server.optionalAuth) return;
  return server.optionalAuth(request, reply);
}

export function requireRole(role: string) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const server = request.server;
    if (!server.requireRole) {
      reply.status(500).send({ error: { code: 'CONFIG_ERROR', message: 'Auth plugin not registered', details: null } });
      return;
    }
    return server.requireRole(role)(request, reply);
  };
}
