import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserStreak extends Model<InferAttributes<UserStreak>, InferCreationAttributes<UserStreak>> {
  declare id: CreationOptional<string>;
  declare currentStreak: CreationOptional<number>;
  declare longestStreak: CreationOptional<number>;
  declare lastActiveDate: string | null;
  declare UserId: string;
}

UserStreak.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  currentStreak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  longestStreak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lastActiveDate: { type: DataTypes.DATEONLY, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'UserStreak' });

User.hasOne(UserStreak, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
UserStreak.belongsTo(User);

export { UserStreak };
