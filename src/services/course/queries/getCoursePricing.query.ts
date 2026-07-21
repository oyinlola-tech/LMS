import { courseRepository } from '../../../repositories/course.repository';

export class GetCoursePricingQuery {
  async execute(courseId: string): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course || !course.isPublished) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const discountPercent = course.previousPrice && course.price
      ? Math.round(((course.previousPrice - course.price) / course.previousPrice) * 100)
      : 0;
    return {
      price: course.price,
      previousPrice: course.previousPrice,
      currency: course.currency,
      discountPercent,
    };
  }
}

export const getCoursePricingQuery = new GetCoursePricingQuery();
