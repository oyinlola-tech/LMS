import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';

class LessonContent extends Model<InferAttributes<LessonContent>, InferCreationAttributes<LessonContent>> {
  declare id: CreationOptional<string>;
  declare heading: string;
  declare subheading: string | null;
  declare content: string;
  declare position: CreationOptional<number>;
  declare LessonId: string;
}

LessonContent.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  heading: { type: DataTypes.STRING(200), allowNull: false },
  subheading: { type: DataTypes.STRING(200), allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonContent' });

Lesson.hasMany(LessonContent, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonContent.belongsTo(Lesson);

export { LessonContent };
