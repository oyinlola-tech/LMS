import { enrollmentRepository } from '../../../repositories/enrollment.repository';

export class GetResumeQuery {
  async execute(userId: string): Promise<any> {
    const enrollment = await enrollmentRepository.findResume(userId);
    if (!enrollment) return null;

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.CourseId,
      courseTitle: enrollment.Course?.title,
      lessonId: enrollment.lastLesson?.id || null,
      lessonTitle: enrollment.lastLesson?.title || null,
      lastPositionSeconds: enrollment.lastPositionSeconds,
      progressPercent: enrollment.progressPercent,
    };
  }
}

export const getResumeQuery = new GetResumeQuery();
