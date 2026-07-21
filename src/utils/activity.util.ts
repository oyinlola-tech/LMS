import { UserStreak, WeeklyTimeLog } from '../models';

const startOfWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
};

const recordActivity = async (userId, minutesDelta = 0) => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [streak] = await UserStreak.findOrCreate({
    where: { UserId: userId },
    defaults: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  });

  if (streak.lastActiveDate !== today) {
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    streak.lastActiveDate = today;
    await streak.save();
  }

  if (minutesDelta > 0) {
    const weekStart = startOfWeek(new Date());
    const [log] = await WeeklyTimeLog.findOrCreate({
      where: { UserId: userId, weekStartDate: weekStart },
      defaults: { minutesSpent: 0 },
    });
    log.minutesSpent += minutesDelta;
    await log.save();
  }

  return streak;
};

export { recordActivity, startOfWeek };
