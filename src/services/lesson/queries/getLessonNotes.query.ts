import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonNoteRepository } from '../../../repositories/lessonNote.repository';

export class GetLessonNotesQuery {
  async execute(lessonId: string, userId: string, userRole: string): Promise<any[]> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonNoteRepository.findByUserAndLesson(userId, lessonId);
  }
}

export const getLessonNotesQuery = new GetLessonNotesQuery();
