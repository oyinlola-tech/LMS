import { Notification } from '../models/Notification.model';

export class NotificationRepository {
  async create(data: Record<string, any>): Promise<any> {
    return Notification.create(data);
  }
}

export const notificationRepository = new NotificationRepository();
