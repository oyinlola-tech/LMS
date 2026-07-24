import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getOverview, getStreak, trackTime, getTimeline } from '../controllers/progress.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate] }, getOverview);

  fastify.get('/streak', { preHandler: [fastify.authenticate] }, getStreak);

  fastify.post('/track-time', { preHandler: [fastify.authenticate] }, trackTime);

  fastify.get('/timeline', { preHandler: [fastify.authenticate] }, getTimeline);
}
