import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listAssignments, getAssignmentsByCourse, getAssignmentsByModule, getAssignmentDetail, startAssignment, submitAssignment, submitAssignmentUpload, gradeAssignment, getMySubmission, getMyAttempts, updateSubmission, listSubmissions, getSubmissionDetail, downloadSubmission, getStudentAssignmentView, handleFileUpload } from '../controllers/assignment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate] }, listAssignments);

  fastify.get('/course/:courseId', { preHandler: [fastify.authenticate] }, getAssignmentsByCourse);

  fastify.get('/module/:moduleId', { preHandler: [fastify.authenticate] }, getAssignmentsByModule);

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, getAssignmentDetail);

  fastify.get('/:id/details', { preHandler: [fastify.authenticate] }, getAssignmentDetail);

  fastify.post('/:id/start', { preHandler: [fastify.authenticate] }, startAssignment);

  fastify.post('/:id/submit', { preHandler: [fastify.authenticate] }, submitAssignment);

  fastify.post('/:id/submit-upload', { preHandler: [fastify.authenticate, handleFileUpload] }, submitAssignmentUpload);

  fastify.post('/:id/grade', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, gradeAssignment);

  fastify.get('/:id/submission', { preHandler: [fastify.authenticate] }, getMySubmission);

  fastify.get('/:id/attempts', { preHandler: [fastify.authenticate] }, getMyAttempts);

  fastify.get('/:id/submissions/me', { preHandler: [fastify.authenticate] }, getMySubmission);

  fastify.put('/:id/submissions/:submissionId', { preHandler: [fastify.authenticate] }, updateSubmission);

  fastify.get('/:id/submissions', { preHandler: [fastify.authenticate] }, listSubmissions);

  fastify.get('/:id/submissions/:submissionId', { preHandler: [fastify.authenticate] }, getSubmissionDetail);

  fastify.get('/:id/submissions/:submissionId/download', { preHandler: [fastify.authenticate] }, downloadSubmission);

  fastify.get('/:id/student-view', { preHandler: [fastify.authenticate] }, getStudentAssignmentView);
}
