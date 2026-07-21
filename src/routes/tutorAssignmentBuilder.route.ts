import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';
import { getTutorCoursesQuery } from '../services/tutorAssignmentBuilder/queries/getCourses.query';
import { getCourseModulesQuery } from '../services/tutorAssignmentBuilder/queries/getModules.query';
import { getAssignmentForEditQuery } from '../services/tutorAssignmentBuilder/queries/getAssignmentForEdit.query';
import { listTutorAssignmentsQuery } from '../services/tutorAssignmentBuilder/queries/listTutorAssignments.query';
import { manageAssignmentCommand } from '../services/tutorAssignmentBuilder/commands/manageAssignment.command';
import { manageResourceCommand } from '../services/tutorAssignmentBuilder/commands/manageResource.command';

export default async function(fastify: FastifyInstance): Promise<void> {
  const guard = [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)];

  fastify.get('/courses', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await getTutorCoursesQuery.execute(request.user!.sub);
      return ok(reply, data, 'Courses loaded');
    } catch (err: any) {
      return error(reply, 500, 'COURSES_FAILED', 'Failed to load courses');
    }
  });

  fastify.get('/courses/:courseId/modules', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { courseId } = request.params as { courseId: string };
      const data = await getCourseModulesQuery.execute(courseId);
      return ok(reply, data, 'Modules loaded');
    } catch (err: any) {
      return error(reply, 500, 'MODULES_FAILED', 'Failed to load modules');
    }
  });

  fastify.get('/list', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await listTutorAssignmentsQuery.execute(request.user!.sub);
      return ok(reply, data, 'Assignments loaded');
    } catch (err: any) {
      return error(reply, 500, 'LIST_FAILED', 'Failed to load assignments');
    }
  });

  fastify.post('/create', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const result = await manageAssignmentCommand.createDraft({
        tutorId: request.user!.sub,
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        type: body.type,
        difficulty: body.difficulty,
        totalPoints: body.totalPoints,
        estimatedTime: body.estimatedTime,
        attemptsAllowed: body.attemptsAllowed,
        submissionType: body.submissionType,
        dueDate: body.dueDate,
        lateSubmissionPolicy: body.lateSubmissionPolicy,
        coreObjective: body.coreObjective,
        CourseId: body.CourseId,
        moduleId: body.moduleId,
      });
      return created(reply, result, 'Assignment created');
    } catch (err: any) {
      return error(reply, 500, 'CREATE_FAILED', 'Failed to create assignment');
    }
  });

  fastify.get('/:id/edit', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = await getAssignmentForEditQuery.execute(id, request.user!.sub);
      return ok(reply, data, 'Assignment loaded');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LOAD_FAILED', err.message || 'Failed to load assignment');
    }
  });

  fastify.put('/:id/details', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      await manageAssignmentCommand.saveDetails({ assignmentId: id, tutorId: request.user!.sub, ...body });
      return ok(reply, null, 'Details saved');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'SAVE_FAILED', err.message || 'Failed to save details');
    }
  });

  fastify.put('/:id/submission-config', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      await manageAssignmentCommand.saveSubmissionConfig({
        assignmentId: id, tutorId: request.user!.sub,
        submissionType: body.submissionType,
        attemptsAllowed: body.attemptsAllowed,
        lateSubmissionPolicy: body.lateSubmissionPolicy,
        fileTypes: body.fileTypes,
        maxFileSizeMb: body.maxFileSizeMb,
        notes: body.notes,
      });
      return ok(reply, null, 'Submission config saved');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'SAVE_FAILED', err.message || 'Failed to save submission config');
    }
  });

  fastify.post('/:id/resources', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const result = await manageResourceCommand.add({
        assignmentId: id, tutorId: request.user!.sub,
        title: body.title, type: body.type, url: body.url,
        description: body.description, fileSize: body.fileSize,
      });
      return created(reply, result, 'Resource added');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ADD_FAILED', err.message || 'Failed to add resource');
    }
  });

  fastify.put('/:id/resources/:resourceId', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { resourceId } = request.params as { resourceId: string };
      const body = request.body as any;
      await manageResourceCommand.update({
        resourceId, tutorId: request.user!.sub,
        title: body.title, type: body.type, url: body.url,
        description: body.description, fileSize: body.fileSize,
      });
      return ok(reply, null, 'Resource updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'UPDATE_FAILED', err.message || 'Failed to update resource');
    }
  });

  fastify.delete('/:id/resources/:resourceId', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { resourceId } = request.params as { resourceId: string };
      await manageResourceCommand.remove(resourceId, request.user!.sub);
      return ok(reply, null, 'Resource removed');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'REMOVE_FAILED', err.message || 'Failed to remove resource');
    }
  });

  fastify.post('/:id/publish', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await manageAssignmentCommand.publish(id, request.user!.sub);
      return ok(reply, null, 'Assignment published');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'PUBLISH_FAILED', err.message || 'Failed to publish');
    }
  });

  fastify.put('/:id/save-draft', { preHandler: guard }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      if (body.details) {
        await manageAssignmentCommand.saveDetails({ assignmentId: id, tutorId: request.user!.sub, ...body.details });
      }
      if (body.submissionConfig) {
        await manageAssignmentCommand.saveSubmissionConfig({
          assignmentId: id, tutorId: request.user!.sub, ...body.submissionConfig,
        });
      }
      return ok(reply, null, 'Draft saved');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'DRAFT_FAILED', err.message || 'Failed to save draft');
    }
  });
}
