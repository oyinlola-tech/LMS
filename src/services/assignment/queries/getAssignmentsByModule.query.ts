import { Course } from '../../../models/Course.model';
import { CourseSection } from '../../../models/CourseSection.model';
import { Enrollment } from '../../../models/Enrollment.model';
import { assignmentRepository } from '../../../repositories/assignment.repository';
import { UserRole } from '../../../enums';

export class GetAssignmentsByModuleQuery {
  async execute(moduleId: string, userId: string, userRole: string): Promise<any[]> {
    const module = await CourseSection.findByPk(moduleId);
    if (!module) {
      const err: any = new Error('Module not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const course = await Course.findByPk(module.CourseId);
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
      const enrollment = await Enrollment.findOne({ where: { UserId: userId, CourseId: course.id } });
      if (!enrollment) {
        const err: any = new Error('Forbidden');
        err.code = 'FORBIDDEN';
        err.statusCode = 403;
        throw err;
      }
    }

    return assignmentRepository.findAllByModule(moduleId);
  }
}

export const getAssignmentsByModuleQuery = new GetAssignmentsByModuleQuery();
