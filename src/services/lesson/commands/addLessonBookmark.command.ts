import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonBookmarkRepository } from '../../../repositories/lessonBookmark.repository';

export interface AddLessonBookmarkInput {
  lessonId: string;
  userId: string;
  userRole: string;
  note?: string;
  timestampSeconds?: number;
}

export class AddLessonBookmarkCommand {
  async execute(input: AddLessonBookmarkInput): Promise<any> {
    const { lessonId, userId, userRole, note, timestampSeconds } = input;

    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonBookmarkRepository.create({
      UserId: userId,
      LessonId: lessonId,
      note,
      timestampSeconds,
    });
  }
}

export const addLessonBookmarkCommand = new AddLessonBookmarkCommand();
