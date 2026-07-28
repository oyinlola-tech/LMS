import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getRecommended, listTutors, followTutor, unfollowTutor, emailStudents, postUpdate, scheduleOfficeHour, getOfficeHours } from '../controllers/tutors.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/recommended', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getRecommended);

  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listTutors);

  fastify.post('/:id/follow', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, followTutor);

  fastify.delete('/:id/follow', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, unfollowTutor);

  fastify.post('/actions/email-students', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, emailStudents);

  fastify.post('/actions/post-update', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, postUpdate);

  fastify.get('/office-hours', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getOfficeHours);

  fastify.post('/actions/schedule-office-hour', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, scheduleOfficeHour);
}