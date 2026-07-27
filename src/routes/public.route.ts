import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getConfig, getLanding, getTestimonials, getPublicProfile } from '../controllers/public.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/config', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getConfig);

  fastify.get('/landing', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getLanding);

  fastify.get('/testimonials', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getTestimonials);

  fastify.get('/u/:userId', getPublicProfile);
}
