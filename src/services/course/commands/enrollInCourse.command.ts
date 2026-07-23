import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { UserStatus } from '../../../enums';
import { Payment } from '../../../models';

export class EnrollInCourseCommand {
  async execute(courseId: string, userId: string): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const existing = await enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      return { enrollmentId: existing.id, alreadyEnrolled: true };
    }

    if (course.price && course.price > 0) {
      const payment = await Payment.findOne({
        where: { UserId: userId, CourseId: courseId, status: 'completed' },
      });
      if (!payment) {
        const err: any = new Error('Payment required. Please complete checkout first.');
        err.code = 'PAYMENT_REQUIRED';
        err.statusCode = 402;
        throw err;
      }
    }

    const enrollment = await enrollmentRepository.create({
      UserId: userId,
      CourseId: courseId,
      status: UserStatus.ACTIVE,
      startedAt: new Date(),
      pricePaid: course.price || 0,
      currency: course.currency || 'USD',
    });

    return { enrollmentId: enrollment.id, alreadyEnrolled: false };
  }
}

export const enrollInCourseCommand = new EnrollInCourseCommand();
