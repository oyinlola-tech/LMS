import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Assignment } from './Assignment.model';
import { User } from './User.model';

class AssignmentSubmission extends Model<InferAttributes<AssignmentSubmission>, InferCreationAttributes<AssignmentSubmission>> {
  declare id: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare submissionNotes: string | null;
  declare fileUrl: string;
  declare fileType: string | null;
  declare fileSizeMb: number | null;
  declare feedback: string | null;
  declare score: number | null;
  declare rubric: string | null;
  declare gradedAt: string | null;
  declare AssignmentId: string;
  declare UserId: string;
}

AssignmentSubmission.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM('submitted', 'graded', 'needs_changes'), allowNull: false, defaultValue: 'submitted' },
  submissionNotes: { type: DataTypes.TEXT, allowNull: true },
  fileUrl: { type: DataTypes.STRING(500), allowNull: false },
  fileType: { type: DataTypes.STRING(50), allowNull: true },
  fileSizeMb: { type: DataTypes.FLOAT, allowNull: true },
  feedback: { type: DataTypes.TEXT, allowNull: true },
  score: { type: DataTypes.INTEGER, allowNull: true },
  rubric: { type: DataTypes.ENUM('exceeds', 'meets', 'partial', 'redo'), allowNull: true },
  gradedAt: { type: DataTypes.DATE, allowNull: true },

  AssignmentId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'AssignmentSubmission' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(Assignment);

User.hasMany(AssignmentSubmission, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AssignmentSubmission.belongsTo(User);

export { AssignmentSubmission };
