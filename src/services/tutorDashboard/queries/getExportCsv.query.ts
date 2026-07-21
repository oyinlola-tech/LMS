import { Course, Enrollment } from '../../../models';
import { Op } from 'sequelize';

export class GetExportCsvQuery {
  async execute(tutorId: string): Promise<string> {
    const courses = await Course.findAll({ where: { tutorId }, order: [['updatedAt', 'DESC']] });
    const courseIds = courses.map((c: any) => c.id);
    const enrollments = courseIds.length
      ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } } })
      : [];

    const headers = ['courseId', 'courseTitle', 'enrollmentId', 'learnerId', 'status', 'progressPercent', 'pricePaid', 'currency', 'createdAt'];
    const rows = enrollments.map((e: any) => {
      const course = courses.find((c: any) => c.id === e.CourseId);
      return [
        e.CourseId, course ? course.title : '', e.id, e.UserId, e.status, e.progressPercent,
        e.pricePaid || '', e.currency || process.env.DEFAULT_CURRENCY, e.createdAt.toISOString(),
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }
}
export const getExportCsvQuery = new GetExportCsvQuery();
