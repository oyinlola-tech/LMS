import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { courseCommentRepository } from '../../../repositories/courseComment.repository';
import { UserRole } from '../../../enums';

export interface CreateCourseCommentInput {
  courseId: string;
  userId: string;
  userRole: string;
  content: string;
}

export class CreateCourseCommentCommand {
  async execute(input: CreateCourseCommentInput): Promise<any> {
    const { courseId, userId, userRole, content } = input;

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

    return courseCommentRepository.create({
      CourseId: courseId,
      UserId: userId,
      content,
    });
  }
}

export const createCourseCommentCommand = new CreateCourseCommentCommand();
