import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonNoteRepository } from '../../../repositories/lessonNote.repository';

export class DeleteLessonNoteCommand {
  async execute(lessonId: string, noteId: string, userId: string, userRole: string): Promise<void> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    await lessonNoteRepository.deleteByIdAndUser(noteId, userId, lessonId);
  }
}

export const deleteLessonNoteCommand = new DeleteLessonNoteCommand();
