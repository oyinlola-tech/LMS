import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { logger } from '../core/loggers';
import { sendEmail, templates } from '../services/mail';

class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: CreationOptional<string>;
  declare type: CreationOptional<string>;
  declare title: string;
  declare message: string;
  declare data: object | null;
  declare isRead: CreationOptional<boolean>;
  declare UserId: string;
}

Notification.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('reminder', 'announcement', 'event', 'feedback', 'system'), allowNull: false, defaultValue: 'system' },
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  data: { type: DataTypes.JSON, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Notification' });

User.hasMany(Notification, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Notification.belongsTo(User);

Notification.addHook('afterCreate', async (notification: any) => {
  try {
    const { broadcastNotification } = await import('../utils/notificationStream.util');
    await broadcastNotification(notification);
  } catch (err: any) {
    logger.error('[NotificationStream]', err.message);
  }

  setImmediate(async () => {
    try {
      const user = await User.findByPk(notification.UserId, { attributes: ['email', 'fullName'] });
      if (!user?.email) return;
      const notificationPayload = typeof notification.toJSON === 'function'
        ? notification.toJSON()
        : notification;
      const notificationUrl = process.env.BRAND_APP_URL
        ? `${process.env.BRAND_APP_URL}/notifications/${notification.id}`
        : undefined;
      await sendEmail({
        to: user.email,
        ...templates.notificationDetailed({
          title: notification.title,
          message: notification.message,
          notificationType: notification.type,
          createdAt: notification.createdAt,
          notificationUrl,
          notificationPayload,
        }),
      });
    } catch (err: any) {
      logger.error('[NotificationEmail]', err.message);
    }
  });
});

export { Notification };
