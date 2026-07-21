import { UserRole } from '../../../enums';
import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { CourseSection } from '../../../models/CourseSection.model';
import { Lesson } from '../../../models/Lesson.model';

export class GetCourseCurriculumQuery {
  async execute(courseId: string, userId: string, userRole: string): Promise<any> {
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

    const sections = await CourseSection.findAll({
      where: { CourseId: courseId },
      include: [{ model: Lesson, attributes: ['id', 'title', 'type', 'position', 'durationSeconds'] }],
      order: [['position', 'ASC'], [Lesson, 'position', 'ASC']],
    });

    return { courseId: course.id, sections };
  }
}

export const getCourseCurriculumQuery = new GetCourseCurriculumQuery();
