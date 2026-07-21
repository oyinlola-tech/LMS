import { Op } from 'sequelize';
import { User, Enrollment, AssignmentSubmission, CourseComment, UserRoleHistory } from '../../../models';

export interface UserDetail {
  profile: {
    id: string; fullName: string; email: string; role: string; status: string;
    avatarUrl: string; phoneNumber: string; location: string; team: string; joinedAt: Date;
  };
  stats: { projects: number; avgScore: number | null };
  roleHistory: UserRoleHistory[];
  activities: Array<{ type: string; createdAt: Date; data: any }>;
}

export class GetUserDetailQuery {
  async execute(userId: string): Promise<UserDetail | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const enrollments = await Enrollment.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    const submissions = await AssignmentSubmission.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    const comments = await CourseComment.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    const roleHistory = await UserRoleHistory.findAll({
      where: { UserId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const totalProjects = await AssignmentSubmission.count({ where: { UserId: user.id } });
    const scored = await AssignmentSubmission.findAll({
      where: { UserId: user.id, score: { [Op.not]: null } },
      attributes: ['score'],
    });
    const avgScore = scored.length
      ? Math.round(scored.reduce((s: number, r: any) => s + Number(r.score || 0), 0) / scored.length)
      : null;

    const activities = [
      ...enrollments.map((e: any) => ({ type: 'enrollment', createdAt: e.createdAt, data: e })),
      ...submissions.map((s: any) => ({ type: 'submission', createdAt: s.createdAt, data: s })),
      ...comments.map((c: any) => ({ type: 'comment', createdAt: c.createdAt, data: c })),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);

    return {
      profile: {
        id: user.id, fullName: user.fullName, email: user.email, role: user.role,
        status: user.status, avatarUrl: user.avatarUrl, phoneNumber: user.phoneNumber,
        location: user.location, team: user.team, joinedAt: user.createdAt,
      },
      stats: { projects: totalProjects, avgScore },
      roleHistory,
      activities,
    };
  }
}
export const getUserDetailQuery = new GetUserDetailQuery();
