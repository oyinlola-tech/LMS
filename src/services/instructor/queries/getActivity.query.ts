import { Op } from 'sequelize';
import { Course, Enrollment, AssignmentSubmission, CourseComment, User } from '../../../models';

export class GetInstructorActivityQuery {
  async execute(tutorId: string) {
    const courses = await Course.findAll({ where: { tutorId } });
    const courseIds = courses.map((c: any) => c.id);

    const submissions = courseIds.length ? await AssignmentSubmission.findAll({
      include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, where: { id: { [Op.in]: courseIds } }, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']], limit: 10,
    }) : [];
    const comments = courseIds.length ? await CourseComment.findAll({
      include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, where: { id: { [Op.in]: courseIds } }, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']], limit: 10,
    }) : [];
    const enrollments = courseIds.length ? await Enrollment.findAll({
      include: [{ model: User, attributes: ['id', 'fullName'] }, { model: Course, where: { id: { [Op.in]: courseIds } }, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']], limit: 10,
    }) : [];

    const activity = [
      ...submissions.map((s: any) => ({ type: 'submission', message: `${s.User?.fullName} submitted work in ${s.Course?.title}`, createdAt: s.createdAt })),
      ...comments.map((c: any) => ({ type: 'comment', message: `${c.User?.fullName} commented on ${c.Course?.title}`, createdAt: c.createdAt })),
      ...enrollments.map((e: any) => ({ type: 'enrollment', message: `${e.User?.fullName} joined ${e.Course?.title}`, createdAt: e.createdAt })),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);

    return activity;
  }
}
export const getInstructorActivityQuery = new GetInstructorActivityQuery();
