import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getResume, listEnrollments, getEnrollmentDetail, updateProgress, completeEnrollment } from '../controllers/enrollment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/resume', { preHandler: [fastify.authenticate] }, getResume);

  fastify.get('/', { preHandler: [fastify.authenticate] }, listEnrollments);

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, getEnrollmentDetail);

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate] }, updateProgress);

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate] }, completeEnrollment);
}
