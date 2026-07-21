import { Course, CourseSection, Lesson } from '../../../models';

export class GetCourseDetailQuery {
  async execute(courseId: string, userId: string): Promise<Course | null> {
    const course = await Course.findByPk(courseId, {
      include: [
        { model: CourseSection, include: [{ model: Lesson }], order: [['position', 'ASC']] },
      ],
      order: [[CourseSection, 'position', 'ASC'], [CourseSection, Lesson, 'position', 'ASC']],
    });
    if (!course) return null;
    if (course.tutorId !== userId) return null;
    return course;
  }
}
export const getCourseDetailQuery = new GetCourseDetailQuery();
