import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonProgressRepository } from '../../../repositories/lessonProgress.repository';
import { recordActivity } from '../../../utils/activity.util';

export class MarkLessonCompleteCommand {
  async execute(lessonId: string, userId: string, userRole: string): Promise<void> {
    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const [progress] = await lessonProgressRepository.findOrCreate(
      { UserId: userId, LessonId: lessonId },
      { progressPercent: 100, completedAt: new Date() },
    );

    if ((progress.progressPercent || 0) < 100) {
      progress.progressPercent = 100;
      progress.completedAt = new Date();
      await lessonProgressRepository.save(progress);
    }

    await recordActivity(userId, 0);
  }
}

export const markLessonCompleteCommand = new MarkLessonCompleteCommand();
