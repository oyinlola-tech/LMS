import { Op } from 'sequelize';
import { Enrollment } from '../models/Enrollment.model';
import { User } from '../models/User.model';
import { Lesson } from '../models/Lesson.model';
import { Course } from '../models/Course.model';

export class EnrollmentRepository {
  async findByUserAndCourse(userId: string, courseId: string): Promise<any> {
    return Enrollment.findOne({ where: { UserId: userId, CourseId: courseId } });
  }

  async findByCourseIds(userId: string, courseIds: string[]): Promise<any[]> {
    return Enrollment.findAll({
      where: { UserId: userId, CourseId: { [Op.in]: courseIds } },
    });
  }

  async findByCourseId(courseId: string): Promise<any[]> {
    return Enrollment.findAll({ where: { CourseId: courseId } });
  }

  async findByCourseIdWithUser(courseId: string): Promise<any[]> {
    return Enrollment.findAll({
      where: { CourseId: courseId },
      include: [{ model: User, attributes: ['id', 'email', 'fullName'] }],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return Enrollment.create(data);
  }

  async findResume(userId: string): Promise<any> {
    return Enrollment.findOne({
      where: { UserId: userId },
      order: [['updatedAt', 'DESC']],
      include: [{ model: Lesson, as: 'lastLesson' }, { model: Course }],
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<any> {
    return Enrollment.findOne({
      where: { id, UserId: userId },
      include: [
        { model: Lesson, as: 'lastLesson' },
        { model: Course, attributes: ['id', 'title', 'thumbnailUrl', 'difficulty', 'totalHours'] },
      ],
    });
  }

  async findAllByUser(userId: string): Promise<any[]> {
    return Enrollment.findAll({
      where: { UserId: userId },
      include: [{ model: Course, attributes: ['id', 'title', 'thumbnailUrl', 'difficulty', 'totalHours'] }],
      order: [['updatedAt', 'DESC']],
    });
  }

  async save(enrollment: any): Promise<any> {
    return enrollment.save();
  }
}

export const enrollmentRepository = new EnrollmentRepository();
