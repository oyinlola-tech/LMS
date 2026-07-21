import { Op } from 'sequelize';
import { Course, CourseReview } from '../../../models';

export class GetInstructorReviewsQuery {
  async execute(tutorId: string) {
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);
    return courseIds.length ? await CourseReview.findAll({
      where: { CourseId: { [Op.in]: courseIds } },
      include: [{ model: Course, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
    }) : [];
  }
}
export const getInstructorReviewsQuery = new GetInstructorReviewsQuery();
