import { learnerStatsRepository } from '../../../repositories/learnerStats.repository';

export class UpdateWeeklyGoalCommand {
  async execute(params: {
    userId: string;
    weeklyGoalHours: number;
    weeklyGoalProgressHours?: number;
  }): Promise<void> {
    const stats = await learnerStatsRepository.findByUserId(params.userId);
    if (stats) {
      stats.weeklyGoalHours = params.weeklyGoalHours;
      if (typeof params.weeklyGoalProgressHours === 'number') {
        stats.weeklyGoalProgressHours = params.weeklyGoalProgressHours;
      }
      await stats.save();
      return;
    }

    await learnerStatsRepository.create({
      UserId: params.userId,
      weeklyGoalHours: params.weeklyGoalHours,
      weeklyGoalProgressHours:
        typeof params.weeklyGoalProgressHours === 'number'
          ? params.weeklyGoalProgressHours
          : 0,
    });
  }
}

export const updateWeeklyGoalCommand = new UpdateWeeklyGoalCommand();
