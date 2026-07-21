import { courseRepository } from '../../../repositories/course.repository';
import { enrollmentRepository } from '../../../repositories/enrollment.repository';

export class GetCourseDetailQuery {
  async execute(courseId: string, userId?: string): Promise<any> {
    const course = await courseRepository.findDetail(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    let enrollment = null;
    if (userId) {
      enrollment = await enrollmentRepository.findByUserAndCourse(userId, courseId);
    }

    const discountPercent = course.previousPrice && course.price
      ? Math.round(((course.previousPrice - course.price) / course.previousPrice) * 100)
      : 0;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
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
      tutorProfile: course.tutor?.TutorProfile || null,
      sections: course.CourseSections || [],
      isEnrolled: Boolean(enrollment),
      progressPercent: enrollment ? enrollment.progressPercent : 0,
    };
  }
}

export const getCourseDetailQuery = new GetCourseDetailQuery();
