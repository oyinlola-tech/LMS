import { LessonContent } from '../models/LessonContent.model';

export class LessonContentRepository {
  async findByLesson(lessonId: string): Promise<any[]> {
    return LessonContent.findAll({
      where: { LessonId: lessonId },
      order: [['position', 'ASC']],
    });
  }
}

export const lessonContentRepository = new LessonContentRepository();
