import { LessonProgress } from '../models/LessonProgress.model';

export class LessonProgressRepository {
  async findOrCreate(where: Record<string, any>, defaults: Record<string, any>): Promise<[any, boolean]> {
    return LessonProgress.findOrCreate({ where, defaults });
  }

  async save(progress: any): Promise<any> {
    return progress.save();
  }
}

export const lessonProgressRepository = new LessonProgressRepository();
