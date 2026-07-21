import { WeeklyTimeLog } from '../../../models';
import { startOfWeek } from '../../../utils/activity.util';

export class TrackTimeCommand {
  async execute(userId: string, minutes: number): Promise<void> {
    if (typeof minutes !== 'number' || minutes <= 0) {
      const err: any = new Error('minutes must be a positive number');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    const weekStart = startOfWeek(new Date());
    const [log] = await WeeklyTimeLog.findOrCreate({
      where: { UserId: userId, weekStartDate: weekStart },
      defaults: { minutesSpent: 0 },
    });
    log.minutesSpent += minutes;
    await log.save();
  }
}
export const trackTimeCommand = new TrackTimeCommand();
