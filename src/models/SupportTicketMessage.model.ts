import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { SupportTicket } from './SupportTicket.model';
import { User } from './User.model';

class SupportTicketMessage extends Model<InferAttributes<SupportTicketMessage>, InferCreationAttributes<SupportTicketMessage>> {
  declare id: CreationOptional<string>;
  declare body: string;
  declare senderRole: CreationOptional<string>;
  declare SupportTicketId: string;
  declare senderId: string;
}

SupportTicketMessage.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  body: { type: DataTypes.TEXT, allowNull: false },
  senderRole: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },

  SupportTicketId: { type: DataTypes.UUID, allowNull: false },
  senderId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'SupportTicketMessage', indexes: [{ fields: ['SupportTicketId'] }, { fields: ['senderId'] }] });

SupportTicket.hasMany(SupportTicketMessage, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
SupportTicketMessage.belongsTo(SupportTicket, { foreignKey: { name: 'SupportTicketId', allowNull: false } });

User.hasMany(SupportTicketMessage, { foreignKey: { name: 'senderId', allowNull: false }, onDelete: 'CASCADE' });
SupportTicketMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

export { SupportTicketMessage };
