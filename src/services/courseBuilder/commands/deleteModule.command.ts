import { CourseSection, Course } from '../../../models';

export class DeleteModuleCommand {
  async execute(moduleId: string, userId: string): Promise<void> {
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
    await courseSection.destroy();
  }
}
export const deleteModuleCommand = new DeleteModuleCommand();
