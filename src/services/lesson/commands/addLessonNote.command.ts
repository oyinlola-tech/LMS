import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonNoteRepository } from '../../../repositories/lessonNote.repository';

export interface AddLessonNoteInput {
  lessonId: string;
  userId: string;
  userRole: string;
  content: string;
  timestampSeconds?: number;
}

export class AddLessonNoteCommand {
  async execute(input: AddLessonNoteInput): Promise<any> {
    const { lessonId, userId, userRole, content, timestampSeconds } = input;

    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonNoteRepository.create({
      UserId: userId,
      LessonId: lessonId,
      content,
      timestampSeconds,
    });
  }
}

export const addLessonNoteCommand = new AddLessonNoteCommand();
