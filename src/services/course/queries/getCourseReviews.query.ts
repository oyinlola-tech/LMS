import { courseRepository } from '../../../repositories/course.repository';
import { courseReviewRepository } from '../../../repositories/courseReview.repository';

export class GetCourseReviewsQuery {
  async execute(courseId: string): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course || !course.isPublished) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return courseReviewRepository.findByCourseId(courseId);
  }
}

export const getCourseReviewsQuery = new GetCourseReviewsQuery();
