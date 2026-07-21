import { UserStreak } from '../../../models';

export class GetStreakQuery {
  async execute(userId: string) {
    const streak = await UserStreak.findOne({ where: { UserId: userId } });
    return streak || { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }
}
export const getStreakQuery = new GetStreakQuery();
