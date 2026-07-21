import { Notification } from '../../../models';

export class ListNotificationsQuery {
  async execute(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { UserId: userId };
    if (unreadOnly) where.isRead = false;
    return Notification.findAll({ where, order: [['createdAt', 'DESC']], limit: 50 });
  }
}
export const listNotificationsQuery = new ListNotificationsQuery();
