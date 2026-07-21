import { LearnerStats } from '../models/LearnerStats.model';

export interface ILearnerStatsAttributes {
  id: string;
  UserId: string;
  weeklyGoalHours: number;
  weeklyGoalProgressHours: number;
  save(): Promise<ILearnerStatsAttributes>;
}

export class LearnerStatsRepository {
  async findByUserId(userId: string): Promise<ILearnerStatsAttributes | null> {
    const stats = await LearnerStats.findOne({ where: { UserId: userId } });
    return stats as unknown as ILearnerStatsAttributes | null;
  }

  async create(data: Record<string, unknown>): Promise<ILearnerStatsAttributes> {
    const stats = await LearnerStats.create(data);
    return stats as unknown as ILearnerStatsAttributes;
  }
}

export const learnerStatsRepository = new LearnerStatsRepository();
