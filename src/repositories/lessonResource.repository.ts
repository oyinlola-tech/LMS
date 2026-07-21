import { LessonResource } from '../models/LessonResource.model';

export class LessonResourceRepository {
  async findByLesson(lessonId: string): Promise<any[]> {
    return LessonResource.findAll({ where: { LessonId: lessonId } });
  }
}

export const lessonResourceRepository = new LessonResourceRepository();
