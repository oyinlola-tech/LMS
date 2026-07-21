import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonResourceRepository } from '../../../repositories/lessonResource.repository';

export class GetLessonResourcesQuery {
  async execute(lessonId: string, userId: string, userRole: string): Promise<any[]> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    return lessonResourceRepository.findByLesson(lessonId);
  }
}

export const getLessonResourcesQuery = new GetLessonResourcesQuery();
