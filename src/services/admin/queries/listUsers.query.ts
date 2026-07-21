import { Op } from 'sequelize';
import { User } from '../../../models';

export class ListUsersQuery {
  async execute(params: { page: number; limit: number; role?: string; status?: string; q?: string }): Promise<{ items: User[]; page: number; limit: number; total: number; totalPages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const where: any = {};

    const role = String(params.role || '').toLowerCase();
    const status = String(params.status || '').toLowerCase();
    const q = String(params.q || '').trim();

    if (['learner', 'tutor', 'admin'].includes(role)) where.role = role;
    if (['active', 'suspended', 'deactivated'].includes(status)) where.status = status;
    if (q) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'fullName', 'email', 'role', 'status', 'avatarUrl', 'createdAt'],
    });

    return { items: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  }
}
export const listUsersQuery = new ListUsersQuery();
