import { FastifyInstance } from 'fastify';
import { getAdminActivities, getUserActivities } from '../controllers/activities.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/admin', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAdminActivities);

  fastify.get('/user/:userId?', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getUserActivities);
}