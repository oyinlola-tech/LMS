import { Course, CourseSection, Lesson } from '../../../models';

export class ReorderLessonsCommand {
  async execute(moduleId: string, userId: string, order: Array<{ id: string; position?: number }>): Promise<void> {
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
    await Promise.all(order.map((item: any, index: number) => Lesson.update(
      { position: item.position ?? index + 1 },
      { where: { id: item.id, courseSectionId: courseSection.id } }
    )));
  }
}
export const reorderLessonsCommand = new ReorderLessonsCommand();
