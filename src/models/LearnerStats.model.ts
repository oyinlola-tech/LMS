import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class LearnerStats extends Model<InferAttributes<LearnerStats>, InferCreationAttributes<LearnerStats>> {
  declare id: CreationOptional<string>;
  declare coursesActive: CreationOptional<number>;
  declare coursesCompleted: CreationOptional<number>;
  declare hoursSpent: CreationOptional<number>;
  declare weeklyGoalHours: CreationOptional<number>;
  declare weeklyGoalProgressHours: CreationOptional<number>;
  declare UserId: string;
}

LearnerStats.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  coursesActive: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  coursesCompleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  hoursSpent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  weeklyGoalHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  weeklyGoalProgressHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LearnerStats' });

User.hasOne(LearnerStats, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LearnerStats.belongsTo(User);

export { LearnerStats };
