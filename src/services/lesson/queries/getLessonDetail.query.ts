import { lessonRepository } from '../../../repositories/lesson.repository';
import { LessonProgress } from '../../../models/LessonProgress.model';

export class GetLessonDetailQuery {
  async execute(lessonId: string, userId: string, userRole: string): Promise<any> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const lesson = await lessonRepository.findDetail(access.lesson.id);

    let progress: any = null;
    if (!access.enrollment) {
      progress = await lessonRepository.findProgress(lesson.id, userId);
    } else {
      progress = access.enrollment;
    }

    if (progress && !progress.dataValues) {
      progress = await LessonProgress.findOne({
        where: { LessonId: lesson.id, UserId: userId },
      });
    }

    let assignmentId: string | null = null;
    const assignment = await lessonRepository.findAssignment(
      lesson.CourseId,
      lesson.courseSectionId,
    );
    if (assignment) {
      assignmentId = assignment.id;
    }

    return {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      durationMinutes: lesson.durationMinutes,
      videoUrl: lesson.videoUrl,
      transcriptUrl: lesson.transcriptUrl,
      contents: lesson.LessonContents || [],
      resources: lesson.LessonResources || [],
      progressPercent: progress ? progress.progressPercent : 0,
      lastPositionSeconds: progress ? progress.lastPositionSeconds : 0,
      assignmentId,
    };
  }
}

export const getLessonDetailQuery = new GetLessonDetailQuery();
