import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserRoleHistory extends Model<InferAttributes<UserRoleHistory>, InferCreationAttributes<UserRoleHistory>> {
  declare id: CreationOptional<string>;
  declare previousRole: string;
  declare newRole: string;
  declare UserId: string;
  declare changedById: string;
}

UserRoleHistory.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  previousRole: { type: DataTypes.STRING(40), allowNull: false },
  newRole: { type: DataTypes.STRING(40), allowNull: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
  changedById: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'UserRoleHistory' });

User.hasMany(UserRoleHistory, { foreignKey: { name: 'UserId', allowNull: false }, onDelete: 'CASCADE' });
UserRoleHistory.belongsTo(User);

User.hasMany(UserRoleHistory, { foreignKey: { name: 'changedById', allowNull: true }, onDelete: 'SET NULL' });
UserRoleHistory.belongsTo(User, { as: 'changedBy', foreignKey: 'changedById' });

export { UserRoleHistory };
