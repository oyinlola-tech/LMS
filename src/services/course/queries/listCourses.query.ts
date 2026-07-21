import { Op } from 'sequelize';
import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { User } from '../../../models/User.model';
import { Specialization } from '../../../models/Specialization.model';

export interface ListCoursesParams {
  specialization?: string;
  category?: string;
  difficulty?: string;
  q?: string;
  userId?: string;
}

export class ListCoursesQuery {
  async execute(params: ListCoursesParams): Promise<any[]> {
    const { specialization, category, difficulty, q, userId } = params;
    const effectiveSpecialization = specialization || category;
    const where: Record<string, any> = { isPublished: true };
    if (difficulty) where.difficulty = difficulty;
    if (q) {
      const escaped = String(q).replace(/[\\%_]/g, '\\$&');
      where.title = { [Op.like]: `%${escaped}%` };
    }

    const include: any[] = [
      { model: User, as: 'tutor', attributes: ['id', 'fullName', 'avatarUrl'] },
    ];
    if (effectiveSpecialization) {
      include.push({ model: Specialization, where: { name: effectiveSpecialization } });
    } else {
      include.push({ model: Specialization, required: false });
    }

    const courses = await courseRepository.findPublishedWithFilters(where, include);

    let enrollmentMap: Record<string, any> = {};
    if (userId) {
      const courseIds = courses.map((c: any) => c.id);
      if (courseIds.length) {
        const enrollments = await enrollmentRepository.findByCourseIds(userId, courseIds);
        enrollmentMap = enrollments.reduce((acc: Record<string, any>, e: any) => {
          acc[e.CourseId] = e;
          return acc;
        }, {});
      }
    }

    return courses.map((course: any) => {
      const enrollment = enrollmentMap[course.id];
      return {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        difficulty: course.difficulty,
        totalHours: course.totalHours,
        tutor: course.tutor,
        isEnrolled: Boolean(enrollment),
        progressPercent: enrollment ? enrollment.progressPercent : 0,
      };
    });
  }
}

export const listCoursesQuery = new ListCoursesQuery();
