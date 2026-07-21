import { Course } from '../../../models';

export class GetCoursePreviewQuery {
  async execute(courseId: string, userId: string): Promise<Course | null> {
    const course = await Course.findByPk(courseId);
    if (!course || course.tutorId !== userId) return null;
    return course;
  }
}
export const getCoursePreviewQuery = new GetCoursePreviewQuery();
