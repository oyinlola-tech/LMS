declare module 'fastify' {
  interface FastifyRequest {
    user?: Record<string, any>;
  }
}

export {};
