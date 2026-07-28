import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listStudents, getStudentDetail, gradeSubmission } from '../controllers/gradebook.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/students', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listStudents);

  fastify.get('/students/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getStudentDetail);

  fastify.put('/students/:id/assignments/:assignmentId/grade', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, gradeSubmission);
}