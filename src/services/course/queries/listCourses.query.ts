import { Op } from 'sequelize';
import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';
import { Course, User, Specialization, CourseReview, Enrollment } from '../../../models';

export interface ListCoursesParams {
  specialization?: string;
  category?: string;
  difficulty?: string;
  q?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CourseListResult {
  courses: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListCoursesQuery {
  async execute(params: ListCoursesParams): Promise<CourseListResult> {
    const { specialization, category, difficulty, q, userId, page = 1, limit = 20 } = params;
    const effectiveSpecialization = specialization || category;
    const offset = (page - 1) * limit;

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

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      include,
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const courseIds = courses.map((c: any) => c.id);

    const [enrollmentMap, ratingMap, enrollmentCountMap] = await Promise.all([
      userId && courseIds.length
        ? enrollmentRepository.findByCourseIds(userId, courseIds).then(rows =>
            rows.reduce((acc: Record<string, any>, e: any) => { acc[e.CourseId] = e; return acc; }, {})
          )
        : Promise.resolve({} as Record<string, any>),
      courseIds.length
        ? CourseReview.findAll({
            where: { CourseId: { [Op.in]: courseIds } },
            attributes: ['CourseId', 'rating'],
          }).then(rows => {
            const map: Record<string, { sum: number; count: number }> = {};
            rows.forEach((r: any) => {
              if (!map[r.CourseId]) map[r.CourseId] = { sum: 0, count: 0 };
              map[r.CourseId].sum += r.rating;
              map[r.CourseId].count += 1;
            });
            return map;
          })
        : Promise.resolve({} as Record<string, { sum: number; count: number }>),
      courseIds.length
        ? Enrollment.findAll({
            where: { CourseId: { [Op.in]: courseIds } },
            attributes: ['CourseId'],
          }).then(rows => {
            const map: Record<string, number> = {};
            rows.forEach((r: any) => { map[r.CourseId] = (map[r.CourseId] || 0) + 1; });
            return map;
          })
        : Promise.resolve({} as Record<string, number>),
    ]);

    const resultCourses = courses.map((course: any) => {
      const enrollment = enrollmentMap[course.id];
      const ratingData = ratingMap[course.id];
      const enrolledCount = enrollmentCountMap[course.id] || 0;
      const avgRating = ratingData ? Math.round((ratingData.sum / ratingData.count) * 10) / 10 : 0;
      const categories = course.categories
        ? (typeof course.categories === 'string' ? JSON.parse(course.categories) : course.categories)
        : [];

      return {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        difficulty: course.difficulty,
        totalHours: course.totalHours,
        totalLessons: course.totalLessons,
        price: course.price,
        previousPrice: course.previousPrice,
        currency: course.currency,
        categories,
        tutor: course.tutor,
        isEnrolled: Boolean(enrollment),
        progressPercent: enrollment ? enrollment.progressPercent : 0,
        avgRating,
        enrolledCount,
      };
    });

    return {
      courses: resultCourses,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export const listCoursesQuery = new ListCoursesQuery();
