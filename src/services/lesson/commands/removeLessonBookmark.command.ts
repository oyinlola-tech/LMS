import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonBookmarkRepository } from '../../../repositories/lessonBookmark.repository';

export class RemoveLessonBookmarkCommand {
  async execute(lessonId: string, bookmarkId: string, userId: string, userRole: string): Promise<void> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    await lessonBookmarkRepository.deleteByIdAndUser(bookmarkId, userId, lessonId);
  }
}

export const removeLessonBookmarkCommand = new RemoveLessonBookmarkCommand();
