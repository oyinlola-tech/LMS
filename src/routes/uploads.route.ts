import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { uploadAvatar } from '../controllers/uploads.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/avatar', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, uploadAvatar);
}