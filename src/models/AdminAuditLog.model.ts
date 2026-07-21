import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class AdminAuditLog extends Model<InferAttributes<AdminAuditLog>, InferCreationAttributes<AdminAuditLog>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare content: string;
  declare status: CreationOptional<string>;
  declare meta: string | null;
  declare actorId: string;
}

AdminAuditLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('success', 'security', 'infrastructure', 'warning'), allowNull: false, defaultValue: 'success' },
  meta: { type: DataTypes.JSON, allowNull: true },

  actorId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'AdminAuditLog' });

User.hasMany(AdminAuditLog, { foreignKey: { name: 'actorId', allowNull: true }, onDelete: 'SET NULL' });
AdminAuditLog.belongsTo(User, { as: 'actor', foreignKey: 'actorId' });

export { AdminAuditLog };
