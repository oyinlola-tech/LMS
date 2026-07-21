import { User, Enrollment, AssignmentSubmission, CourseComment } from '../../../models';

export class GetUserActivityQuery {
  async execute(userId: string, limit: number = 50): Promise<Array<{ type: string; createdAt: Date; data: any }>> {
    const user = await User.findByPk(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const enrollments = await Enrollment.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit,
    });
    const submissions = await AssignmentSubmission.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit,
    });
    const comments = await CourseComment.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit,
    });

    return [
      ...enrollments.map((e: any) => ({ type: 'enrollment', createdAt: e.createdAt, data: e })),
      ...submissions.map((s: any) => ({ type: 'submission', createdAt: s.createdAt, data: s })),
      ...comments.map((c: any) => ({ type: 'comment', createdAt: c.createdAt, data: c })),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
}
export const getUserActivityQuery = new GetUserActivityQuery();
