import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Quiz } from './Quiz.model';

class QuizQuestion extends Model<InferAttributes<QuizQuestion>, InferCreationAttributes<QuizQuestion>> {
  declare id: CreationOptional<string>;
  declare prompt: string;
  declare points: CreationOptional<number>;
  declare position: CreationOptional<number>;
  declare QuizId: string;
}

QuizQuestion.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  prompt: { type: DataTypes.TEXT, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  QuizId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'QuizQuestion' });

Quiz.hasMany(QuizQuestion, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Quiz);

export { QuizQuestion };
