import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  applyMentorship,
  getCourseMentors,
  getMyApplication,
  getApplications,
  approveApplication,
  rejectApplication,
} from '../controllers/mentorship.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/apply', { preHandler: [fastify.authenticate] }, applyMentorship);

  fastify.get('/course/:courseId', getCourseMentors);

  fastify.get('/my-application/:courseId', { preHandler: [fastify.authenticate] }, getMyApplication);

  fastify.get('/applications/:courseId', { preHandler: [fastify.authenticate] }, getApplications);

  fastify.post('/:id/approve', { preHandler: [fastify.authenticate] }, approveApplication);

  fastify.post('/:id/reject', { preHandler: [fastify.authenticate] }, rejectApplication);
}