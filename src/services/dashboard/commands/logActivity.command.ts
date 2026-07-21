import { LearnerStats } from '../../../models';

export class LogActivityCommand {
  async execute(userId: string, hoursSpent: number): Promise<void> {
    const existing = await LearnerStats.findOne({ where: { UserId: userId } });
    if (existing) {
      existing.hoursSpent = (existing.hoursSpent || 0) + hoursSpent;
      await existing.save();
    } else {
      await LearnerStats.create({
        UserId: userId,
        hoursSpent,
        coursesActive: 0,
        coursesCompleted: 0,
        weeklyGoalHours: 0,
        weeklyGoalProgressHours: 0,
      });
    }
  }
}
export const logActivityCommand = new LogActivityCommand();
