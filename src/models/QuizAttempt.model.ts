import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Quiz } from './Quiz.model';
import { User } from './User.model';

class QuizAttempt extends Model<InferAttributes<QuizAttempt>, InferCreationAttributes<QuizAttempt>> {
  declare id: CreationOptional<string>;
  declare score: CreationOptional<number>;
  declare total: CreationOptional<number>;
  declare status: CreationOptional<string>;
  declare answers: object | null;
  declare QuizId: string;
  declare UserId: string;
}

QuizAttempt.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('in_progress', 'submitted'), allowNull: false, defaultValue: 'in_progress' },
  answers: { type: DataTypes.JSON, allowNull: true },

  QuizId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'QuizAttempt' });

Quiz.hasMany(QuizAttempt, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
QuizAttempt.belongsTo(Quiz);

User.hasMany(QuizAttempt, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
QuizAttempt.belongsTo(User);

export { QuizAttempt };
