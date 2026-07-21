import { LessonNote } from '../models/LessonNote.model';

export class LessonNoteRepository {
  async findByUserAndLesson(userId: string, lessonId: string): Promise<any[]> {
    return LessonNote.findAll({
      where: { UserId: userId, LessonId: lessonId },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return LessonNote.create(data);
  }

  async deleteByIdAndUser(noteId: string, userId: string, lessonId: string): Promise<number> {
    return LessonNote.destroy({ where: { id: noteId, UserId: userId, LessonId: lessonId } });
  }
}

export const lessonNoteRepository = new LessonNoteRepository();
