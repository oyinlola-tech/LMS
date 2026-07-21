import { Notification } from '../../../models';

const validTypes = ['reminder', 'announcement', 'event', 'feedback', 'system'];

export class CreateNotificationCommand {
  async execute(userId: string, body: { type: string; title: string; message: string; data?: any }): Promise<Notification> {
    const { type, title, message, data } = body;
    if (!type || !title || !message) {
      const err: any = new Error('type, title, and message are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    if (!validTypes.includes(type)) {
      const err: any = new Error('invalid notification type');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    return Notification.create({ UserId: userId, type, title, message, data: data || null });
  }
}
export const createNotificationCommand = new CreateNotificationCommand();
