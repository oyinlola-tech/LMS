import { Course, CourseSection } from '../../../models';
import { Op } from 'sequelize';

export class GetTutorCoursesQuery {
  async execute(tutorId: string): Promise<any[]> {
    const courses = await Course.findAll({
      where: { tutorId },
      attributes: ['id', 'title', 'thumbnailUrl', 'isPublished'],
      order: [['createdAt', 'DESC']],
    });
    return courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl,
      isPublished: c.isPublished,
    }));
  }
}
export const getTutorCoursesQuery = new GetTutorCoursesQuery();
