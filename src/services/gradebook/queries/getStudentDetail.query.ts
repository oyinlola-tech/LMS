import { Op } from 'sequelize';
import { User, Course, Enrollment, Assignment, AssignmentSubmission } from '../../../models';

export class GetGradebookStudentQuery {
  async execute(tutorId: string, studentId: string) {
    const student = await User.findByPk(studentId, { attributes: ['id', 'fullName', 'avatarUrl', 'email'] });
    if (!student) return null;

    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);

    const enrollments = await Enrollment.findAll({
      where: { UserId: student.id, CourseId: { [Op.in]: courseIds } },
      include: [{ model: Course, attributes: ['id', 'title'] }],
    });
    if (!enrollments.length) return null;

    const submissions = await AssignmentSubmission.findAll({
      where: { UserId: student.id },
      include: [{ model: Assignment, include: [{ model: Course, attributes: ['id', 'title'] }] }],
      order: [['createdAt', 'DESC']],
    });

    return { student, enrollments, submissions };
  }
}
export const getGradebookStudentQuery = new GetGradebookStudentQuery();
