import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getResume, listEnrollments, getEnrollmentDetail, updateProgress, completeEnrollment } from '../controllers/enrollment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/resume', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getResume);

  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listEnrollments);

  fastify.get('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getEnrollmentDetail);

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateProgress);

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, completeEnrollment);
}