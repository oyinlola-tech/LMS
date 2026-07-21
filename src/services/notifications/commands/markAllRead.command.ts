import { Notification } from '../../../models';

export class MarkAllNotificationsReadCommand {
  async execute(userId: string): Promise<void> {
    await Notification.update({ isRead: true }, { where: { UserId: userId } });
  }
}
export const markAllNotificationsReadCommand = new MarkAllNotificationsReadCommand();
