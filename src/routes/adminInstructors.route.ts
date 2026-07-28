import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import {
  getInstructor,
  updateInstructor,
  addInstructorNote,
  getInstructorNotes,
  assignCourseToInstructor,
  createInstructor,
} from '../controllers/adminInstructors.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getInstructor);

  fastify.patch('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateInstructor);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addInstructorNote);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getInstructorNotes);

  fastify.post('/:id/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, assignCourseToInstructor);

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createInstructor);
}