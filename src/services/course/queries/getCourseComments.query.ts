import { UserRole } from '../../../enums';
import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { courseCommentRepository } from '../../../repositories/courseComment.repository';

export class GetCourseCommentsQuery {
  async execute(courseId: string, userId: string, userRole: string): Promise<any[]> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (userRole === UserRole.TUTOR && course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    if (userRole === UserRole.LEARNER) {
      const enrollment = await enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (!enrollment) {
        const err: any = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        err.statusCode = 403;
        throw err;
      }
    }

    return courseCommentRepository.findByCourseId(courseId);
  }
}

export const getCourseCommentsQuery = new GetCourseCommentsQuery();
