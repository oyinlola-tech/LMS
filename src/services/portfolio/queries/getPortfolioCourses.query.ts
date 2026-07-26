import { Enrollment, Course } from '../../../models';

export class GetPortfolioCoursesQuery {
  async execute(userId: string): Promise<Enrollment[]> {
    return Enrollment.findAll({
      where: { UserId: userId, status: 'completed' },
      include: [{ model: Course, attributes: ['id', 'title', 'thumbnailUrl', 'category'] }],
      order: [['completedAt', 'DESC']],
      limit: 50,
    });
  }
}
export const getPortfolioCoursesQuery = new GetPortfolioCoursesQuery();
