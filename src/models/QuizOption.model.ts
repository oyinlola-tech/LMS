import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { QuizQuestion } from './QuizQuestion.model';

class QuizOption extends Model<InferAttributes<QuizOption>, InferCreationAttributes<QuizOption>> {
  declare id: CreationOptional<string>;
  declare text: string;
  declare isCorrect: CreationOptional<boolean>;
  declare QuizQuestionId: string;
}

QuizOption.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.STRING(500), allowNull: false },
  isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  QuizQuestionId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'QuizOption' });

QuizQuestion.hasMany(QuizOption, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
QuizOption.belongsTo(QuizQuestion);

export { QuizOption };
