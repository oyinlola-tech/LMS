import { Assignment } from '../models/Assignment.model';
import { AssignmentRequirement } from '../models/AssignmentRequirement.model';
import { User } from '../models/User.model';
import { Course } from '../models/Course.model';
import { CourseSection } from '../models/CourseSection.model';
import { Enrollment } from '../models/Enrollment.model';
import { Op } from 'sequelize';
import { UserRole } from '../enums';

export interface AccessCheckResult {
  allowed: boolean;
  code?: string;
  message?: string;
  status?: number;
}

export interface AssignmentWithAccess {
  assignment: any;
  access: AccessCheckResult;
}

export class AssignmentRepository {
  async findById(id: string): Promise<any> {
    return Assignment.findByPk(id);
  }

  async findByIdWithCourseAndTutor(id: string): Promise<any> {
    return Assignment.findByPk(id, {
      include: [{ model: Course, attributes: ['id', 'title'], include: [{ model: User, as: 'tutor', attributes: ['fullName'] }] }],
    });
  }

  async findByIdWithIncludes(id: string): Promise<any> {
    return Assignment.findByPk(id, {
      include: [
        { model: AssignmentRequirement },
        { model: User, as: 'createdBy', attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: Course, attributes: ['id', 'title'] },
        { model: CourseSection, as: 'module', attributes: ['id', 'title', 'position'] },
      ],
    });
  }

  async findByIdWithRequirement(id: string): Promise<any> {
    return Assignment.findByPk(id, {
      include: [{ model: AssignmentRequirement }],
    });
  }

  async findAndCountAllByCourseIds(
    courseIds: string[] | null,
    learnerView: boolean,
    limit: number,
    offset: number,
  ): Promise<{ rows: any[]; count: number }> {
    const where: Record<string, any> = {};
    if (courseIds && courseIds.length === 0) {
      return { rows: [], count: 0 };
    }
    if (courseIds) where.CourseId = { [Op.in]: courseIds };
    if (learnerView) where.status = 'published';

    return Assignment.findAndCountAll({
      where,
      include: [
        { model: Course, attributes: ['id', 'title', 'thumbnailUrl'] },
        { model: CourseSection, as: 'module', attributes: ['id', 'title', 'position'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findAllByCourse(courseId: string): Promise<any[]> {
    return Assignment.findAll({
      where: { CourseId: courseId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findAllByModule(moduleId: string): Promise<any[]> {
    return Assignment.findAll({
      where: { moduleId },
      order: [['createdAt', 'DESC']],
    });
  }

  async checkAccess(assignment: any, userId: string, userRole: string): Promise<AccessCheckResult> {
    const course = await Course.findByPk(assignment.CourseId);
    if (!course) {
      return { allowed: false, code: 'NOT_FOUND', message: 'Course not found', status: 404 };
    }
    if (userRole === UserRole.TUTOR) {
      if (course.tutorId !== userId) {
        return { allowed: false, code: 'FORBIDDEN', message: 'Forbidden', status: 403 };
      }
      return { allowed: true };
    }
    if (assignment.status !== 'published') {
      return { allowed: false, code: 'FORBIDDEN', message: 'Forbidden', status: 403 };
    }
    const enrollment = await Enrollment.findOne({
      where: { UserId: userId, CourseId: course.id },
    });
    if (!enrollment) {
      return { allowed: false, code: 'FORBIDDEN', message: 'Forbidden', status: 403 };
    }
    return { allowed: true };
  }

  async getCourseIdsForUser(userId: string, userRole: string): Promise<string[] | null> {
    if (userRole === UserRole.TUTOR) {
      const courses = await Course.findAll({ where: { tutorId: userId }, attributes: ['id'] });
      return courses.map((c: any) => c.id);
    }
    if (userRole === 'admin') {
      return null;
    }
    const enrollments = await Enrollment.findAll({
      where: { UserId: userId },
      attributes: ['CourseId'],
    });
    return enrollments.map((e: any) => e.CourseId);
  }
}

export const assignmentRepository = new AssignmentRepository();
