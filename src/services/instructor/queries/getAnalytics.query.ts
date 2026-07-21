import { Op } from 'sequelize';
import { Course, Enrollment, CourseReview } from '../../../models';

export class GetInstructorAnalyticsQuery {
  async execute(tutorId: string) {
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);
    const enrollments = courseIds.length ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } } }) : [];
    const totalRevenue = enrollments.reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);
    const totalStudents = new Set(enrollments.map((e: any) => e.UserId)).size;
    const reviews = courseIds.length ? await CourseReview.findAll({ where: { CourseId: { [Op.in]: courseIds } } }) : [];
    const avgRating = reviews.length ? Number((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(2)) : 0;
    return { totalRevenue, totalStudents, avgRating, courseCount: courses.length };
  }
}
export const getInstructorAnalyticsQuery = new GetInstructorAnalyticsQuery();
