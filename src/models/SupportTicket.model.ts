import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class SupportTicket extends Model<InferAttributes<SupportTicket>, InferCreationAttributes<SupportTicket>> {
  declare id: CreationOptional<string>;
  declare subject: string;
  declare message: string;
  declare status: CreationOptional<string>;
  declare priority: CreationOptional<string>;
  declare category: string | null;
  declare UserId: string;
}

SupportTicket.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  subject: { type: DataTypes.STRING(191), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'), allowNull: false, defaultValue: 'open' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: false, defaultValue: 'medium' },
  category: { type: DataTypes.STRING(80), allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'SupportTicket', indexes: [{ fields: ['UserId'] }, { fields: ['status'] }] });

User.hasMany(SupportTicket, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
SupportTicket.belongsTo(User);

export { SupportTicket };
