import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonCommentRepository } from '../../../repositories/lessonComment.repository';

export interface AddLessonCommentInput {
  lessonId: string;
  userId: string;
  userRole: string;
  content: string;
}

export class AddLessonCommentCommand {
  async execute(input: AddLessonCommentInput): Promise<any> {
    const { lessonId, userId, userRole, content } = input;

    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonCommentRepository.create({
      LessonId: lessonId,
      UserId: userId,
      content,
    });
  }
}

export const addLessonCommentCommand = new AddLessonCommentCommand();
