import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';
import { User } from './User.model';

class LessonProgress extends Model<InferAttributes<LessonProgress>, InferCreationAttributes<LessonProgress>> {
  declare id: CreationOptional<string>;
  declare progressPercent: CreationOptional<number>;
  declare lastPositionSeconds: CreationOptional<number>;
  declare completedAt: string | null;
  declare LessonId: string;
  declare UserId: string;
}

LessonProgress.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  progressPercent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  lastPositionSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  completedAt: { type: DataTypes.DATE, allowNull: true },

  LessonId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonProgress', indexes: [{ unique: true, fields: ['UserId', 'LessonId'] }] });

User.hasMany(LessonProgress, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonProgress.belongsTo(User);

Lesson.hasMany(LessonProgress, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonProgress.belongsTo(Lesson);

export { LessonProgress };
