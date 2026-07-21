import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';

class Quiz extends Model<InferAttributes<Quiz>, InferCreationAttributes<Quiz>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare passingScore: number | null;
  declare timeLimitMinutes: number | null;
  declare LessonId: string;
}

Quiz.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  passingScore: { type: DataTypes.INTEGER, allowNull: true },
  timeLimitMinutes: { type: DataTypes.INTEGER, allowNull: true },

  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Quiz' });

Lesson.hasOne(Quiz, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Quiz.belongsTo(Lesson);

export { Quiz };
