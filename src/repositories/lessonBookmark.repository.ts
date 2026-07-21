import { LessonBookmark } from '../models/LessonBookmark.model';

export class LessonBookmarkRepository {
  async findByUserAndLesson(userId: string, lessonId: string): Promise<any[]> {
    return LessonBookmark.findAll({
      where: { UserId: userId, LessonId: lessonId },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return LessonBookmark.create(data);
  }

  async deleteByIdAndUser(bookmarkId: string, userId: string, lessonId: string): Promise<number> {
    return LessonBookmark.destroy({ where: { id: bookmarkId, UserId: userId, LessonId: lessonId } });
  }
}

export const lessonBookmarkRepository = new LessonBookmarkRepository();
