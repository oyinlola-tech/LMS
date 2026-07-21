import { UserRoleHistory } from '../../../models';

export class GetUserRoleHistoryQuery {
  async execute(userId: string): Promise<UserRoleHistory[]> {
    return UserRoleHistory.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']],
    });
  }
}
export const getUserRoleHistoryQuery = new GetUserRoleHistoryQuery();
