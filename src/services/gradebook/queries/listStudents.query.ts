import { Op } from 'sequelize';
import { Course, Enrollment, User, Assignment, AssignmentSubmission } from '../../../models';

export class ListGradebookStudentsQuery {
  async execute(tutorId: string) {
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);

    const enrollments = courseIds.length
      ? await Enrollment.findAll({ where: { CourseId: { [Op.in]: courseIds } }, include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'email'] }] })
      : [];

    const submissions = courseIds.length
      ? await AssignmentSubmission.findAll({ include: [{ model: Assignment, where: { CourseId: { [Op.in]: courseIds } } }] })
      : [];

    const byStudent = new Map();
    enrollments.forEach((e: any) => {
      if (!e.User) return;
      if (!byStudent.has(e.User.id)) {
        byStudent.set(e.User.id, { student: e.User, courses: [], avgScore: null, progressPercent: 0 });
      }
      byStudent.get(e.User.id).courses.push({ courseId: e.CourseId, status: e.status, progressPercent: e.progressPercent });
    });

    const scoresByStudent = new Map();
    submissions.forEach((s: any) => {
      if (s.score === null || s.score === undefined) return;
      const list = scoresByStudent.get(s.UserId) || [];
      list.push(Number(s.score));
      scoresByStudent.set(s.UserId, list);
    });

    byStudent.forEach((value: any, studentId: string) => {
      const scores = scoresByStudent.get(studentId) || [];
      if (scores.length) value.avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      value.progressPercent = value.courses.length ? Math.round(value.courses.reduce((s: number, c: any) => s + (c.progressPercent || 0), 0) / value.courses.length) : 0;
    });

    return Array.from(byStudent.values());
  }
}
export const listGradebookStudentsQuery = new ListGradebookStudentsQuery();
