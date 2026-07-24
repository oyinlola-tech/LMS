import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { getTutorOverviewQuery } from '../services/tutorDashboard/queries/getOverview.query';
import { getExportCsvQuery } from '../services/tutorDashboard/queries/getExportCsv.query';
import { getSubmissionQueueQuery } from '../services/tutorDashboard/queries/getSubmissionQueue.query';

export const getOverview = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await getTutorOverviewQuery.execute(request.user!.sub);
    return ok(reply, data, 'Tutor dashboard loaded');
  } catch (err: any) {
    return error(reply, 500, 'TUTOR_DASHBOARD_FAILED', 'Failed to load tutor dashboard');
  }
};

export const getExport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const csv = await getExportCsvQuery.execute(request.user!.sub);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="tutor-analytics.csv"');
    return reply.send(csv);
  } catch (err: any) {
    return error(reply, 500, 'EXPORT_FAILED', 'Failed to export analytics');
  }
};

export const getSubmissionQueue = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const sort = (request.query as any).sort || 'pending';
    const queue = await getSubmissionQueueQuery.execute(request.user!.sub, sort);
    return ok(reply, queue, 'Submission queue loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUBMISSION_QUEUE_FAILED', 'Failed to load submission queue');
  }
};