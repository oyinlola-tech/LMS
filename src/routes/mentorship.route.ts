import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  applyMentorship,
  getCourseMentors,
  getMyApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  listMentorshipPrograms,
  listMyApplications,
  applyToProgram,
} from '../controllers/mentorship.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/programs', listMentorshipPrograms);

  fastify.get('/my-applications', { preHandler: [fastify.authenticate] }, listMyApplications);

  fastify.post('/apply', { preHandler: [fastify.authenticate] }, applyMentorship);

  fastify.post('/:id/apply', { preHandler: [fastify.authenticate] }, applyToProgram);

  fastify.get('/course/:courseId', getCourseMentors);

  fastify.get('/my-application/:courseId', { preHandler: [fastify.authenticate] }, getMyApplication);

  fastify.get('/applications/:courseId', { preHandler: [fastify.authenticate] }, getApplications);

  fastify.post('/:id/approve', { preHandler: [fastify.authenticate] }, approveApplication);

  fastify.post('/:id/reject', { preHandler: [fastify.authenticate] }, rejectApplication);
}
