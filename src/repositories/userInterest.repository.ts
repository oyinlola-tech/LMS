import { UserInterest } from '../models/UserInterest.model';

export class UserInterestRepository {
  async findByUserId(userId: string): Promise<any[]> {
    return UserInterest.findAll({ where: { UserId: userId } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await UserInterest.destroy({ where: { UserId: userId } });
  }

  async create(data: Record<string, any>): Promise<any> {
    return UserInterest.create(data);
  }
}

export const userInterestRepository = new UserInterestRepository();
