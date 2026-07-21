import { Op } from 'sequelize';
import { CourseReview } from '../models/CourseReview.model';
import { User } from '../models/User.model';
import { Course } from '../models/Course.model';

export class CourseReviewRepository {
  async findByCourseId(courseId: string): Promise<any[]> {
    return CourseReview.findAll({
      where: { CourseId: courseId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
  }

  async create(data: {
    CourseId: string;
    UserId: string;
    rating: number;
    comment?: string | null;
    consentToFeature?: boolean;
  }): Promise<CourseReview> {
    return CourseReview.create(data);
  }

  async getAggregateRating(courseId: string): Promise<{ avgRating: number; reviewCount: number }> {
    const reviews = await CourseReview.findAll({
      where: { CourseId: courseId },
      attributes: [
        [CourseReview.sequelize.fn('AVG', CourseReview.sequelize.col('rating')), 'avgRating'],
        [CourseReview.sequelize.fn('COUNT', CourseReview.sequelize.col('id')), 'reviewCount'],
      ],
      raw: true,
    });
    const avgRating = reviews.length ? Number((reviews[0] as any).avgRating) : 0;
    const reviewCount = reviews.length ? Number((reviews[0] as any).reviewCount) : 0;
    return { avgRating, reviewCount };
  }

  async findFeatured(limit = 10): Promise<any[]> {
    return CourseReview.findAll({
      where: { rating: 5, consentToFeature: true, comment: { [Op.ne]: null } },
      include: [
        { model: User, attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: Course, attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}

export const courseReviewRepository = new CourseReviewRepository();
