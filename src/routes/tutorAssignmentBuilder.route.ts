import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getCourses, getCourseModules, listAssignments, createAssignment, getAssignmentForEdit, saveDetails, saveSubmissionConfig, addResource, updateResource, removeResource, publishAssignment, saveDraft } from '../controllers/tutorAssignmentBuilder.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  const guard = [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)];

  fastify.get('/courses', { preHandler: guard, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourses);

  fastify.get('/courses/:courseId/modules', { preHandler: guard, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getCourseModules);

  fastify.get('/list', { preHandler: guard, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listAssignments);

  fastify.post('/create', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createAssignment);

  fastify.get('/:id/edit', { preHandler: guard, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAssignmentForEdit);

  fastify.put('/:id/details', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, saveDetails);

  fastify.put('/:id/submission-config', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, saveSubmissionConfig);

  fastify.post('/:id/resources', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, addResource);

  fastify.put('/:id/resources/:resourceId', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateResource);

  fastify.delete('/:id/resources/:resourceId', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, removeResource);

  fastify.post('/:id/publish', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, publishAssignment);

  fastify.put('/:id/save-draft', { preHandler: guard, config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, saveDraft);
}