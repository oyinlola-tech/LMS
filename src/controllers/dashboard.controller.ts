import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { getOverviewQuery } from '../services/dashboard/queries/getOverview.query';

export const getOverview = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await getOverviewQuery.execute(request.user!.sub);
    return ok(reply, data, 'Dashboard loaded');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'DASHBOARD_FAILED', err.message || 'Failed to load dashboard');
  }
};
