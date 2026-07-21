import { Course } from '../../../models';

export class GetEnrollmentPreviewQuery {
  async execute(courseId: string, userId: string): Promise<{ courseId: string; price: number; currency: string } | null> {
    const course = await Course.findByPk(courseId);
    if (!course || course.tutorId !== userId) return null;
    return { courseId: course.id, price: course.price, currency: course.currency };
  }
}
export const getEnrollmentPreviewQuery = new GetEnrollmentPreviewQuery();
