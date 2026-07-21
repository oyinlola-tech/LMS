import { Course } from '../../../models';

export class PublishCourseCommand {
  async execute(courseId: string, userId: string): Promise<void> {
    const course = await Course.findByPk(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    course.isPublished = true;
    await course.save();
  }
}
export const publishCourseCommand = new PublishCourseCommand();
