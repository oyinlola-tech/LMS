import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

async function csrfPlugin(fastify: FastifyInstance): Promise<void> {
  const csrfEnabled = String(process.env.CSRF_ENABLED || 'false') === 'true';
  if (!csrfEnabled) return;

  try {
    const csrf = await import('@fastify/csrf-protection');
    await fastify.register(csrf.default || csrf, {
      getToken: (request: FastifyRequest) => {
        const header = request.headers['x-csrf-token'];
        return typeof header === 'string' ? header : null;
      },
      cookieKey: '_csrf',
      cookieOpts: {
        sameSite: 'strict',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    });
  } catch {
    fastify.log.warn('CSRF protection disabled — @fastify/csrf-protection not available');
  }
}

export default fp(csrfPlugin, { name: 'csrf' });
