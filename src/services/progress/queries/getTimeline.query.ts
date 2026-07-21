import { WeeklyTimeLog } from '../../../models';

export class GetTimelineQuery {
  async execute(userId: string, range = 'weekly', periods = 12) {
    const limit = Math.min(52, Number(periods) || 12);
    const logs = await WeeklyTimeLog.findAll({
      where: { UserId: userId },
      order: [['weekStartDate', 'DESC']],
      limit,
    });

    if (range === 'monthly') {
      const monthly: Record<string, number> = {};
      logs.forEach((l: any) => {
        const monthKey = String(l.weekStartDate).slice(0, 7);
        monthly[monthKey] = (monthly[monthKey] || 0) + l.minutesSpent;
      });
      return Object.keys(monthly).sort().map((k: string) => ({ period: k, minutes: monthly[k] }));
    }

    return logs.map((l: any) => ({ period: l.weekStartDate, minutes: l.minutesSpent })).reverse();
  }
}
export const getTimelineQuery = new GetTimelineQuery();
