import { Notification } from '../../../models';

export class MarkNotificationReadCommand {
  async execute(userId: string, notificationId: string): Promise<void> {
    const notification = await Notification.findOne({ where: { id: notificationId, UserId: userId } });
    if (!notification) {
      const err: any = new Error('Notification not found');
      err.code = 'NOT_FOUND'; err.statusCode = 404; throw err;
    }
    notification.isRead = true;
    await notification.save();
  }
}
export const markNotificationReadCommand = new MarkNotificationReadCommand();
