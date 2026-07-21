import { QuizAttempt } from '../models/QuizAttempt.model';

export class QuizAttemptRepository {
  async findByIdAndUser(id: string, userId: string): Promise<any> {
    return QuizAttempt.findOne({ where: { id, UserId: userId } });
  }

  async create(data: Record<string, any>): Promise<any> {
    return QuizAttempt.create(data);
  }

  async save(attempt: any): Promise<any> {
    return attempt.save();
  }
}

export const quizAttemptRepository = new QuizAttemptRepository();
