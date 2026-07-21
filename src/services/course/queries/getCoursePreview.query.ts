import { courseRepository } from '../../../repositories/course.repository';
import { courseReviewRepository } from '../../../repositories/courseReview.repository';

export class GetCoursePreviewQuery {
  async execute(id: string): Promise<any> {
    const course = await courseRepository.findPreview(id);
    if (!course || !course.isPublished) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const { avgRating, reviewCount } = await courseReviewRepository.getAggregateRating(course.id);
    const discountPercent = course.previousPrice && course.price
      ? Math.round(((course.previousPrice - course.price) / course.previousPrice) * 100)
      : 0;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      descriptionHtml: course.descriptionHtml,
      thumbnailUrl: course.thumbnailUrl,
      difficulty: course.difficulty,
      totalHours: course.totalHours,
      totalLessons: course.totalLessons,
      price: course.price,
      previousPrice: course.previousPrice,
      discountPercent,
      currency: course.currency,
      perks: course.perks || [],
      tutor: course.tutor,
      specialization: course.Specializations || null,
      rating: Number.isFinite(avgRating) ? Number(avgRating.toFixed(2)) : 0,
      reviewCount,
    };
  }
}

export const getCoursePreviewQuery = new GetCoursePreviewQuery();
