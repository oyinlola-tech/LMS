import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { MessageThread } from './MessageThread.model';

class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<string>;
  declare ThreadId: string | null;
  declare body: string;
  declare readAt: string | null;
  declare MessageThreadId: string;
  declare senderId: string;
}

Message.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ThreadId: { type: DataTypes.UUID, allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: false },
  readAt: { type: DataTypes.DATE, allowNull: true },

  MessageThreadId: { type: DataTypes.UUID, allowNull: false },
  senderId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Message', indexes: [{ fields: ['MessageThreadId'] }, { fields: ['ThreadId'] }, { fields: ['senderId'] }, { fields: ['createdAt'] }] });

MessageThread.hasMany(Message, { foreignKey: { name: 'MessageThreadId', allowNull: false }, onDelete: 'CASCADE' });
Message.belongsTo(MessageThread, { foreignKey: { name: 'MessageThreadId', allowNull: false } });

Message.beforeValidate((message: any) => {
  if (!message.MessageThreadId && message.ThreadId) {
    message.MessageThreadId = message.ThreadId;
  }
  if (!message.ThreadId && message.MessageThreadId) {
    message.ThreadId = message.MessageThreadId;
  }
});

export function associate(models: any) {
  Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
}

export { Message };
