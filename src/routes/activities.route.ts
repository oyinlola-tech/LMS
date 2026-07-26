import { FastifyInstance } from 'fastify';
import { getAdminActivities, getUserActivities } from '../controllers/activities.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/admin', { preHandler: [fastify.authenticate] }, getAdminActivities);

  fastify.get('/user/:userId?', { preHandler: [fastify.authenticate] }, getUserActivities);
}
