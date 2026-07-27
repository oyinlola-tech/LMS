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
  fastify.get('/programs', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listMentorshipPrograms);

  fastify.get('/my-applications', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listMyApplications);

  fastify.post('/apply', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, applyMentorship);

  fastify.post('/:id/apply', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, applyToProgram);

  fastify.get('/course/:courseId', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourseMentors);

  fastify.get('/my-application/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMyApplication);

  fastify.get('/applications/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getApplications);

  fastify.post('/:id/approve', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, approveApplication);

  fastify.post('/:id/reject', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, rejectApplication);
}
