import { UserRole } from '../../../enums';
import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { courseCommentRepository } from '../../../repositories/courseComment.repository';

export class GetCourseCommentsQuery {
  async execute(courseId: string, userId: string, userRole: string, page: number = 1, limit: number = 10): Promise<any> {
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

    const { rows, count } = await courseCommentRepository.findTopLevel(courseId, page, limit);

    const items = await Promise.all(rows.map(async (c: any) => {
      const replyCount = await courseCommentRepository.getReplyCount(c.id);
      const cJson = c.toJSON();
      cJson.User = c.User;
      cJson.replyCount = replyCount;
      return cJson;
    }));

    return {
      items,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export const getCourseCommentsQuery = new GetCourseCommentsQuery();
