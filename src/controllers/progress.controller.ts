import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { getProgressOverviewQuery } from '../services/progress/queries/getOverview.query';
import { getStreakQuery } from '../services/progress/queries/getStreak.query';
import { getTimelineQuery } from '../services/progress/queries/getTimeline.query';
import { trackTimeCommand } from '../services/progress/commands/trackTime.command';

export const getOverview = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await getProgressOverviewQuery.execute(request.user!.sub);
    return ok(reply, data, 'Progress overview loaded');
  } catch (err: any) {
    return error(reply, 500, 'PROGRESS_OVERVIEW_FAILED', 'Failed to load progress overview');
  }
};

export const getStreak = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const streak = await getStreakQuery.execute(request.user!.sub);
    return ok(reply, streak, 'Streak loaded');
  } catch (err: any) {
    return error(reply, 500, 'STREAK_FAILED', 'Failed to load streak');
  }
};

export const trackTime = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { minutes } = (request.body as Record<string, any>) || {};
    await trackTimeCommand.execute(request.user!.sub, minutes);
    return ok(reply, null, 'Time tracked');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'TRACK_TIME_FAILED', err.message || 'Failed to track time');
  }
};

export const getTimeline = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { range, periods } = request.query as any;
    const series = await getTimelineQuery.execute(request.user!.sub, range, Number(periods));
    return ok(reply, series, 'Timeline loaded');
  } catch (err: any) {
    return error(reply, 500, 'TIMELINE_FAILED', 'Failed to load timeline');
  }
};
