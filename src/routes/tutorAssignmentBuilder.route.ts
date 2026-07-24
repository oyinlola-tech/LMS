import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { getCourses, getCourseModules, listAssignments, createAssignment, getAssignmentForEdit, saveDetails, saveSubmissionConfig, addResource, updateResource, removeResource, publishAssignment, saveDraft } from '../controllers/tutorAssignmentBuilder.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  const guard = [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)];

  fastify.get('/courses', { preHandler: guard }, getCourses);

  fastify.get('/courses/:courseId/modules', { preHandler: guard }, getCourseModules);

  fastify.get('/list', { preHandler: guard }, listAssignments);

  fastify.post('/create', { preHandler: guard }, createAssignment);

  fastify.get('/:id/edit', { preHandler: guard }, getAssignmentForEdit);

  fastify.put('/:id/details', { preHandler: guard }, saveDetails);

  fastify.put('/:id/submission-config', { preHandler: guard }, saveSubmissionConfig);

  fastify.post('/:id/resources', { preHandler: guard }, addResource);

  fastify.put('/:id/resources/:resourceId', { preHandler: guard }, updateResource);

  fastify.delete('/:id/resources/:resourceId', { preHandler: guard }, removeResource);

  fastify.post('/:id/publish', { preHandler: guard }, publishAssignment);

  fastify.put('/:id/save-draft', { preHandler: guard }, saveDraft);
}
