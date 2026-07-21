import { lessonRepository } from '../../../repositories/lesson.repository';
import { lessonProgressRepository } from '../../../repositories/lessonProgress.repository';
import { recordActivity } from '../../../utils/activity.util';

export interface UpdateLessonProgressInput {
  lessonId: string;
  userId: string;
  userRole: string;
  progressPercent?: number;
  lastPositionSeconds?: number;
  minutesSpent?: number;
}

export class UpdateLessonProgressCommand {
  async execute(input: UpdateLessonProgressInput): Promise<void> {
    const { lessonId, userId, userRole, progressPercent, lastPositionSeconds, minutesSpent } = input;

    const access = await lessonRepository.checkAccess(lessonId, userId, userRole);
    if (!access.allowed) {
      const err: any = new Error(access.code === 'NOT_FOUND' ? 'Lesson not found' : 'Forbidden');
      err.code = access.code;
      err.statusCode = access.status;
      throw err;
    }

    const [progress] = await lessonProgressRepository.findOrCreate(
      { UserId: userId, LessonId: lessonId },
      { progressPercent: progressPercent || 0, lastPositionSeconds: lastPositionSeconds || 0 },
    );

    if (progressPercent !== undefined) progress.progressPercent = progressPercent;
    if (lastPositionSeconds !== undefined) progress.lastPositionSeconds = lastPositionSeconds;

    if (progress.progressPercent >= 100 && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    await lessonProgressRepository.save(progress);

    if (minutesSpent) {
      await recordActivity(userId, minutesSpent);
    }
  }
}

export const updateLessonProgressCommand = new UpdateLessonProgressCommand();
