import { LessonComment } from '../models/LessonComment.model';
import { User } from '../models/User.model';

export class LessonCommentRepository {
  async findByLesson(lessonId: string): Promise<any[]> {
    return LessonComment.findAll({
      where: { LessonId: lessonId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return LessonComment.create(data);
  }
}

export const lessonCommentRepository = new LessonCommentRepository();
