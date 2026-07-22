import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { Enrollment } from '../models';
import { getResumeQuery } from '../services/enrollment/queries/getResume.query';
import { listEnrollmentsQuery } from '../services/enrollment/queries/listEnrollments.query';
import { getEnrollmentDetailQuery } from '../services/enrollment/queries/getEnrollmentDetail.query';
import { updateProgressCommand } from '../services/enrollment/commands/updateProgress.command';
import { AppError } from '../errors';
import { validateUpdateProgress } from '../validators/enrollment.validator';
import type { IdParams, UpdateProgressBody } from '../types';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/resume', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getResumeQuery.execute(request.user!.sub);
      if (!result) {
        return ok(reply, null, 'No resume data');
      }
      return ok(reply, result, 'Resume data loaded');
    } catch (err) {
      request.log.error(err, 'RESUME_FAILED');
      return error(reply, 500, 'RESUME_FAILED', 'Failed to load resume data');
    }
  });

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await listEnrollmentsQuery.execute(request.user!.sub);
      return ok(reply, result, 'Enrollments loaded');
    } catch (err) {
      request.log.error(err, 'ENROLLMENTS_FAILED');
      return error(reply, 500, 'ENROLLMENTS_FAILED', 'Failed to load enrollments');
    }
  });

  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getEnrollmentDetailQuery.execute(id, request.user!.sub);
      return ok(reply, result, 'Enrollment loaded');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'ENROLLMENT_LOAD_FAILED', 'Failed to load enrollment');
    }
  });

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as UpdateProgressBody;
    const validation = validateUpdateProgress(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      await updateProgressCommand.execute({
        enrollmentId: id,
        userId: request.user!.sub,
        progressPercent: body.progressPercent,
        lastLessonId: (body as any).lastLessonId,
        lastPositionSeconds: body.lastPositionSeconds,
        hoursSpent: (body as any).hoursSpent,
      });
      return ok(reply, null, 'Progress updated');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        return error(reply, 404, err.code, err.message);
      }
      return error(reply, 500, 'PROGRESS_UPDATE_FAILED', 'Failed to update progress');
    }
  });

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const enrollment = await Enrollment.findOne({
        where: { id, UserId: request.user!.sub },
      });
      if (!enrollment) {
        return error(reply, 404, 'NOT_FOUND', 'Enrollment not found');
      }
      enrollment.set('status', 'completed');
      enrollment.set('completedAt', new Date());
      await enrollment.save();
      return ok(reply, { enrollmentId: id }, 'Course completed');
    } catch (err: unknown) {
      request.log.error(err, 'COMPLETE_FAILED');
      return error(reply, 500, 'COMPLETE_FAILED', 'Failed to complete course');
    }
  });
}
