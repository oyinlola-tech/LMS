import { CourseSection, Course } from '../../../models';

export class UpdateModuleCommand {
  async execute(moduleId: string, userId: string, body: { title?: string; position?: number }): Promise<CourseSection> {
    const courseSection = await CourseSection.findByPk(moduleId, { include: [{ model: Course }] });
    if (!courseSection) {
      const err: any = new Error('Module not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if ((courseSection as any).Course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    if (body.title) courseSection.title = body.title;
    if (body.position !== undefined) courseSection.position = body.position;
    await courseSection.save();
    return courseSection;
  }
}
export const updateModuleCommand = new UpdateModuleCommand();
