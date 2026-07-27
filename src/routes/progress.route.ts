import { FastifyInstance } from 'fastify';
import { getOverview, getStreak, trackTime, getTimeline, getCourses } from '../controllers/progress.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getOverview);

  fastify.get('/courses', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourses);

  fastify.get('/streak', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getStreak);

  fastify.post('/track-time', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, trackTime);

  fastify.get('/timeline', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTimeline);
}
