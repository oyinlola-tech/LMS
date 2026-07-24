import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { UserRole } from '../enums';
import { sendMarketingEmailCommand } from '../services/marketing/commands/sendMarketingEmail.command';
import { getSuggestedCoursesQuery } from '../services/marketing/queries/getSuggestedCourses.query';

export async function getSuggestedCourses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { limit } = request.query as any;
    const courses = await getSuggestedCoursesQuery.execute(request.user!.sub, Number(limit) || 5);
    return ok(reply, courses, 'Suggested courses loaded');
  } catch (err) {
    request.log.error(err, 'SUGGESTED_COURSES_FAILED');
    return error(reply, 500, 'SUGGESTED_COURSES_FAILED', 'Failed to load suggested courses');
  }
}

export async function sendCampaign(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userIds, subject } = (request.body as Record<string, any>) || {};
    const targetUserIds = Array.isArray(userIds) ? userIds : [];
    if (!targetUserIds.length) return error(reply, 400, 'VALIDATION_ERROR', 'userIds array is required');

    const results = await Promise.allSettled(
      targetUserIds.map((uid: string) => sendMarketingEmailCommand.execute({ userId: uid, subject }))
    );

    const summary = results.map((r, idx) => ({
      userId: targetUserIds[idx],
      status: r.status === 'fulfilled' ? (r.value.sent ? 'sent' : 'skipped') : 'error',
      reason: r.status === 'rejected' ? String(r.reason) : (r.status === 'fulfilled' ? r.value.reason : undefined),
    }));

    return ok(reply, { total: targetUserIds.length, results: summary }, 'Campaign processed');
  } catch (err) {
    request.log.error(err, 'MARKETING_SEND_FAILED');
    return error(reply, 500, 'MARKETING_SEND_FAILED', 'Failed to send marketing campaign');
  }
}
