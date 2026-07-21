import { CourseSection } from '../../../models';

export class ReorderModulesCommand {
  async execute(courseId: string, userId: string, order: Array<{ id: string; position?: number }>): Promise<void> {
    await Promise.all(order.map((item: any, index: number) => CourseSection.update(
      { position: item.position ?? index + 1 },
      { where: { id: item.id, CourseId: courseId } }
    )));
  }
}
export const reorderModulesCommand = new ReorderModulesCommand();
