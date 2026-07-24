import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getRecommended, listTutors, followTutor, unfollowTutor, emailStudents, postUpdate, scheduleOfficeHour } from '../controllers/tutors.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/recommended', { preHandler: [fastify.authenticate] }, getRecommended);

  fastify.get('/', { preHandler: [fastify.authenticate] }, listTutors);

  fastify.post('/:id/follow', { preHandler: [fastify.authenticate] }, followTutor);

  fastify.delete('/:id/follow', { preHandler: [fastify.authenticate] }, unfollowTutor);

  fastify.post('/actions/email-students', { preHandler: [fastify.authenticate] }, emailStudents);

  fastify.post('/actions/post-update', { preHandler: [fastify.authenticate] }, postUpdate);

  fastify.post('/actions/schedule-office-hour', { preHandler: [fastify.authenticate] }, scheduleOfficeHour);
}
