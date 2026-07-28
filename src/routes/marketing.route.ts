import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getSuggestedCourses, sendCampaign } from '../controllers/marketing.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/suggested-courses', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getSuggestedCourses);

  fastify.post('/send', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, sendCampaign);
}