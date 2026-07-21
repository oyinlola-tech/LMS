import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  await (fastify as any).register(fastifySwagger, {
    openapi: {
      info: {
        title: 'LearnBridge API',
        description: 'LearnBridge learning platform API',
        version: '1.0.0',
      },
      servers: [{ url: process.env.API_URL || 'http://localhost:4000' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await (fastify as any).register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { explorer: true },
  });
}

export default fp(swaggerPlugin, { name: 'swagger' });
