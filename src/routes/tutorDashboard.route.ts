import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { ok, error } from '../utils/response.util';
import { getTutorOverviewQuery } from '../services/tutorDashboard/queries/getOverview.query';
import { getExportCsvQuery } from '../services/tutorDashboard/queries/getExportCsv.query';
import { getSubmissionQueueQuery } from '../services/tutorDashboard/queries/getSubmissionQueue.query';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/overview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await getTutorOverviewQuery.execute(request.user!.sub);
      return ok(reply, data, 'Tutor dashboard loaded');
    } catch (err: any) {
      return error(reply, 500, 'TUTOR_DASHBOARD_FAILED', 'Failed to load tutor dashboard');
    }
  });

  fastify.get('/export', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const csv = await getExportCsvQuery.execute(request.user!.sub);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="tutor-analytics.csv"');
      return reply.send(csv);
    } catch (err: any) {
      return error(reply, 500, 'EXPORT_FAILED', 'Failed to export analytics');
    }
  });

  fastify.get('/submission-queue', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sort = (request.query as any).sort || 'pending';
      const queue = await getSubmissionQueueQuery.execute(request.user!.sub, sort);
      return ok(reply, queue, 'Submission queue loaded');
    } catch (err: any) {
      return error(reply, 500, 'SUBMISSION_QUEUE_FAILED', 'Failed to load submission queue');
    }
  });
}
