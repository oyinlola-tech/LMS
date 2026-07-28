import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { listAssignments, getAssignmentsByCourse, getAssignmentsByModule, getAssignmentDetail, startAssignment, submitAssignment, submitAssignmentUpload, gradeAssignment, getMySubmission, getMyAttempts, updateSubmission, listSubmissions, getSubmissionDetail, downloadSubmission, getStudentAssignmentView, handleFileUpload } from '../controllers/assignment.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listAssignments);

  fastify.get('/course/:courseId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAssignmentsByCourse);

  fastify.get('/module/:moduleId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAssignmentsByModule);

  fastify.get('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAssignmentDetail);

  fastify.get('/:id/details', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getAssignmentDetail);

  fastify.post('/:id/start', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, startAssignment);

  fastify.post('/:id/submit', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, submitAssignment);

  fastify.post('/:id/submit-upload', { preHandler: [fastify.authenticate, handleFileUpload], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, submitAssignmentUpload);

  fastify.post('/:id/grade', { preHandler: [fastify.authenticate, fastify.requireAtLeastRole(UserRole.TUTOR)], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, gradeAssignment);

  fastify.get('/:id/submission', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMySubmission);

  fastify.get('/:id/attempts', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMyAttempts);

  fastify.get('/:id/submissions/me', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getMySubmission);

  fastify.put('/:id/submissions/:submissionId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateSubmission);

  fastify.get('/:id/submissions', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, listSubmissions);

  fastify.get('/:id/submissions/:submissionId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getSubmissionDetail);

  fastify.get('/:id/submissions/:submissionId/download', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, downloadSubmission);

  fastify.get('/:id/student-view', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getStudentAssignmentView);
}