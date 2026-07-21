import { UserAdminNote, User } from '../../../models';

export class GetUserNotesQuery {
  async execute(userId: string): Promise<UserAdminNote[]> {
    return UserAdminNote.findAll({
      where: { UserId: userId },
      include: [{ model: User, as: 'admin', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  }
}
export const getUserNotesQuery = new GetUserNotesQuery();
