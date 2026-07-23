import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserWarning extends Model<InferAttributes<UserWarning>, InferCreationAttributes<UserWarning>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare issuedById: string;
  declare reason: string;
  declare readAt: string | null;
}

UserWarning.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  issuedById: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
}, { sequelize, tableName: 'user_warnings', indexes: [{ fields: ['userId'] }] });

User.hasMany(UserWarning, { as: 'warnings', foreignKey: 'userId', onDelete: 'CASCADE' });
UserWarning.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(UserWarning, { as: 'warningsIssued', foreignKey: 'issuedById', onDelete: 'CASCADE' });
UserWarning.belongsTo(User, { as: 'issuedBy', foreignKey: 'issuedById' });

export { UserWarning };
