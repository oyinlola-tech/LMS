import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getConfig, getLanding, getTestimonials } from '../controllers/public.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/config', getConfig);

  fastify.get('/landing', getLanding);

  fastify.get('/testimonials', getTestimonials);
}
