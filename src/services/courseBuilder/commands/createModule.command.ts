import { Course, CourseSection } from '../../../models';

export class CreateModuleCommand {
  async execute(courseId: string, userId: string, body: { title: string; position?: number }): Promise<CourseSection> {
    if (!body.title) {
      const err: any = new Error('title is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
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
    return CourseSection.create({
      CourseId: course.id,
      title: body.title,
      position: body.position || 0,
    });
  }
}
export const createModuleCommand = new CreateModuleCommand();
