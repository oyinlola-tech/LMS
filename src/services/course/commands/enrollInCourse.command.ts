import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { UserStatus } from '../../../enums';

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

    const enrollment = await enrollmentRepository.create({
      UserId: userId,
      CourseId: courseId,
      status: UserStatus.ACTIVE,
      startedAt: new Date(),
    });

    return { enrollmentId: enrollment.id, alreadyEnrolled: false };
  }
}

export const enrollInCourseCommand = new EnrollInCourseCommand();
