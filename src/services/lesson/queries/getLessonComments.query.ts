import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonCommentRepository } from '../../../repositories/lessonComment.repository';

export class GetLessonCommentsQuery {
  async execute(lessonId: string, userId: string, userRole: string): Promise<any[]> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonCommentRepository.findByLesson(lessonId);
  }
}

export const getLessonCommentsQuery = new GetLessonCommentsQuery();
