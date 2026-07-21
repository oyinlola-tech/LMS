import { Assignment, Course, CourseSection } from '../../../models';
import { Op } from 'sequelize';

export class ListTutorAssignmentsQuery {
  async execute(tutorId: string): Promise<any[]> {
    const assignments = await Assignment.findAll({
      include: [
        { model: Course, attributes: ['id', 'title'], where: { tutorId } },
        { model: CourseSection, as: 'module', attributes: ['id', 'title', 'position'] },
      ],
      order: [['updatedAt', 'DESC']],
    });
    return assignments.map((a: any) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      status: a.status,
      difficulty: a.difficulty,
      dueDate: a.dueDate,
      totalPoints: a.totalPoints,
      course: a.Course ? { id: a.Course.id, title: a.Course.title } : null,
      module: a.module ? { id: a.module.id, title: a.module.title } : null,
      updatedAt: a.updatedAt,
      submissionCount: a.submissionCount || 0,
    }));
  }
}
export const listTutorAssignmentsQuery = new ListTutorAssignmentsQuery();
