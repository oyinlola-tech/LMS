import { Op } from 'sequelize';
import { User, Follow, UserInterest, Enrollment, Course } from '../../../models';

export class GetRecommendedUsersQuery {
  async execute(userId: string, params: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(20, Math.max(1, Number(params.limit || 10)));
    const offset = (page - 1) * limit;

    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId'],
    });
    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId);

    const userInterests = await UserInterest.findAll({
      where: { UserId: userId },
      attributes: ['name'],
    });
    const interests = userInterests.map((ui: any) => ui.name);

    const enrollments = await Enrollment.findAll({
      where: { UserId: userId },
      include: [{ model: Course, attributes: ['category'] }],
    });
    const courseCategories = [...new Set(enrollments.map((e: any) => e.Course?.category).filter(Boolean))];

    const relevancyCases: string[] = [];
    const relevancyParams: any[] = [];
    let paramIndex = 1;

    if (interests.length) {
      interests.forEach(interest => {
        relevancyCases.push(`EXISTS (SELECT 1 FROM "UserInterests" WHERE "UserId" = "User"."id" AND "name" = $${paramIndex})`);
        relevancyParams.push(interest);
        paramIndex++;
      });
    }
    if (courseCategories.length) {
      courseCategories.forEach(cat => {
        relevancyCases.push(`EXISTS (SELECT 1 FROM "Enrollments" e JOIN "Courses" c ON c."id" = e."CourseId" WHERE e."UserId" = "User"."id" AND c."category" = $${paramIndex})`);
        relevancyParams.push(cat);
        paramIndex++;
      });
    }

    let users: User[];
    if (relevancyCases.length) {
      const relevancySql = relevancyCases.join(' + ');
      const query = `
        SELECT *, (${relevancySql}) AS relevancy
        FROM "Users" AS "User"
        WHERE "User"."id" NOT IN (${followingIds.map((_, i) => `$${paramIndex + i}`).join(',')})
        AND "User"."status" = 'active'
        AND "User"."isPrivate" = false
        ORDER BY relevancy DESC, "User"."fullName" ASC
        LIMIT $${paramIndex + followingIds.length}
        OFFSET $${paramIndex + followingIds.length + 1}
      `;
      const allParams = [...relevancyParams, ...followingIds, String(limit), String(offset)];
      users = await User.sequelize!.query(query, {
        bind: allParams,
        model: User,
        mapToModel: true,
      });
    } else {
      users = await User.findAll({
        where: {
          id: { [Op.notIn]: followingIds },
          status: 'active',
        },
        order: [['fullName', 'ASC']],
        limit,
        offset,
      });
    }

    const total = await User.count({
      where: {
        id: { [Op.notIn]: followingIds },
        status: 'active',
      },
    });

    const items = users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      bio: u.bio,
      isVerified: u.isVerified,
      checkmarkType: u.checkmarkType,
      studentId: u.studentId,
      tutorId: u.tutorId,
      adminId: u.adminId,
    }));

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }
}
export const getRecommendedUsersQuery = new GetRecommendedUsersQuery();
