import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { submitContact } from '../controllers/contact.controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/', { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, submitContact);
}