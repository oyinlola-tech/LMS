import { CourseCertificate } from '../../../models/CourseCertificate.model';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { notificationRepository } from '../../../repositories/notification.repository';
import { recordActivity } from '../../../utils/activity.util';

export interface UpdateProgressInput {
  enrollmentId: string;
  userId: string;
  progressPercent?: number;
  lastLessonId?: string;
  lastPositionSeconds?: number;
  hoursSpent?: number;
}

export class UpdateProgressCommand {
  async execute(input: UpdateProgressInput): Promise<void> {
    const { enrollmentId, userId, progressPercent, lastLessonId, lastPositionSeconds, hoursSpent } = input;

    const enrollment = await enrollmentRepository.findByIdAndUser(enrollmentId, userId);
    if (!enrollment) {
      const err: any = new Error('Enrollment not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (typeof progressPercent === 'number') {
      enrollment.progressPercent = progressPercent;
    }
    if (typeof lastLessonId === 'string') {
      enrollment.lastLessonId = lastLessonId;
    }
    if (typeof lastPositionSeconds === 'number') {
      enrollment.lastPositionSeconds = lastPositionSeconds;
    }
    if (typeof hoursSpent === 'number') {
      enrollment.hoursSpent = hoursSpent;
    }

    if (enrollment.progressPercent >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      const existingCert = await CourseCertificate.findOne({
        where: { UserId: userId, CourseId: enrollment.CourseId },
      });
      if (!existingCert) {
        await notificationRepository.create({
          UserId: userId,
          type: 'system',
          title: 'Course completed',
          message: 'You completed a course. Generate your certificate.',
          data: { courseId: enrollment.CourseId },
        });
      }
    }

    await enrollmentRepository.save(enrollment);

    await recordActivity(
      userId,
      typeof hoursSpent === 'number' ? hoursSpent * 60 : 0,
    );
  }
}

export const updateProgressCommand = new UpdateProgressCommand();
