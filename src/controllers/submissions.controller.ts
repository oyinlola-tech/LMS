import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { listSubmissionsQuery } from '../services/submissions/queries/listSubmissions.query';

export async function listSubmissions(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page, limit } = request.query as any;
    const result = await listSubmissionsQuery.execute(request.user!.sub, { page: Number(page), limit: Number(limit) });
    return ok(reply, result, 'Submissions loaded');
  } catch (err: any) {
    return error(reply, 500, 'SUBMISSIONS_LOAD_FAILED', 'Failed to load submissions');
  }
}
