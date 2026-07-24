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
  fastify.get('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, getInstructor);

  fastify.patch('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, updateInstructor);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, addInstructorNote);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, getInstructorNotes);

  fastify.post('/:id/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, assignCourseToInstructor);

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, createInstructor);
}