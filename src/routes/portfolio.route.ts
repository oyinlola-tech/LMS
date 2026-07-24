import { FastifyInstance } from 'fastify';
import { getPortfolio, getMyPortfolio, savePortfolio, getPortfolioCourses } from '../controllers/portfolio.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/me/courses', { preHandler: [fastify.authenticate] }, getPortfolioCourses);

  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMyPortfolio);

  fastify.put('/me', { preHandler: [fastify.authenticate] }, savePortfolio);

  fastify.get('/:userId/courses', getPortfolioCourses);

  fastify.get('/:userId', getPortfolio);
}
