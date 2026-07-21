import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserSkillProgress extends Model<InferAttributes<UserSkillProgress>, InferCreationAttributes<UserSkillProgress>> {
  declare id: CreationOptional<string>;
  declare skill: string;
  declare level: CreationOptional<string>;
  declare percent: CreationOptional<number>;
  declare lessonsCompleted: CreationOptional<number>;
  declare hoursSpent: CreationOptional<number>;
  declare UserId: string;
}

UserSkillProgress.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  skill: { type: DataTypes.STRING(100), allowNull: false },
  level: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'), allowNull: false, defaultValue: 'beginner' },
  percent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  lessonsCompleted: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  hoursSpent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'UserSkillProgress' });

User.hasMany(UserSkillProgress, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
UserSkillProgress.belongsTo(User);

export { UserSkillProgress };
