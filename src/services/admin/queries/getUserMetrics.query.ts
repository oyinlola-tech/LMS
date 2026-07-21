import { User, Enrollment, AssignmentSubmission, CourseComment } from '../../../models';

export class GetUserMetricsQuery {
  async execute(userId: string): Promise<{ enrollments: number; submissions: number; comments: number; avgScore: number | null; lastActivityAt: Date | null } | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const enrollments = await Enrollment.count({ where: { UserId: user.id } });
    const submissions = await AssignmentSubmission.findAll({
      where: { UserId: user.id },
      attributes: ['score', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    const comments = await CourseComment.count({ where: { UserId: user.id } });

    const scored = submissions.filter((s: any) => s.score !== null && s.score !== undefined);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s: number, r: any) => s + Number(r.score || 0), 0) / scored.length)
      : null;
    const lastActivityAt = submissions.length ? submissions[0].createdAt : null;

    return { enrollments, submissions: submissions.length, comments, avgScore, lastActivityAt };
  }
}
export const getUserMetricsQuery = new GetUserMetricsQuery();
