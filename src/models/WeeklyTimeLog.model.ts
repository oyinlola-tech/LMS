import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class WeeklyTimeLog extends Model<InferAttributes<WeeklyTimeLog>, InferCreationAttributes<WeeklyTimeLog>> {
  declare id: CreationOptional<string>;
  declare weekStartDate: string;
  declare minutesSpent: CreationOptional<number>;
  declare UserId: string;
}

WeeklyTimeLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  weekStartDate: { type: DataTypes.DATEONLY, allowNull: false },
  minutesSpent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'WeeklyTimeLog' });

User.hasMany(WeeklyTimeLog, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
WeeklyTimeLog.belongsTo(User);

export { WeeklyTimeLog };
