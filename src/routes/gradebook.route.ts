import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { listGradebookStudentsQuery } from '../services/gradebook/queries/listStudents.query';
import { getGradebookStudentQuery } from '../services/gradebook/queries/getStudentDetail.query';
import { gradeSubmissionCommand } from '../services/gradebook/commands/gradeSubmission.command';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/students', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await listGradebookStudentsQuery.execute(request.user!.sub);
      return ok(reply, result, 'Gradebook students loaded');
    } catch (err: any) {
      return error(reply, 500, 'GRADEBOOK_FAILED', 'Failed to load gradebook');
    }
  });

  fastify.get('/students/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getGradebookStudentQuery.execute(request.user!.sub, (request.params as any).id);
      if (!result) return error(reply, 403, 'FORBIDDEN', 'Student not in your courses');
      return ok(reply, result, 'Gradebook student loaded');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'GRADEBOOK_STUDENT_FAILED', err.message || 'Failed to load student');
    }
  });

  fastify.put('/students/:id/assignments/:assignmentId/grade', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const submission = await gradeSubmissionCommand.execute(request.user!.sub, (request.params as any).id, (request.params as any).assignmentId, (request.body as any) || {});
      return ok(reply, submission, 'Submission graded');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'GRADE_SUBMISSION_FAILED', err.message || 'Failed to grade submission');
    }
  });
}
