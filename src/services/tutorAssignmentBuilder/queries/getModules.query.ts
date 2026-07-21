import { CourseSection } from '../../../models';

export class GetCourseModulesQuery {
  async execute(courseId: string): Promise<any[]> {
    const sections = await CourseSection.findAll({
      where: { CourseId: courseId },
      attributes: ['id', 'title', 'position', 'coreObjective'],
      order: [['position', 'ASC']],
    });
    return sections.map((s: any) => ({
      id: s.id,
      title: s.title,
      position: s.position,
      coreObjective: s.coreObjective,
    }));
  }
}
export const getCourseModulesQuery = new GetCourseModulesQuery();
