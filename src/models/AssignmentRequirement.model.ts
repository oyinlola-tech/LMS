import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Assignment } from './Assignment.model';

class AssignmentRequirement extends Model<InferAttributes<AssignmentRequirement>, InferCreationAttributes<AssignmentRequirement>> {
  declare id: CreationOptional<string>;
  declare fileTypes: object | null;
  declare maxFileSizeMb: number | null;
  declare notes: string | null;
  declare AssignmentId: string;
}

AssignmentRequirement.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fileTypes: { type: DataTypes.JSON, allowNull: true },
  maxFileSizeMb: { type: DataTypes.FLOAT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },

  AssignmentId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'AssignmentRequirement' });

Assignment.hasOne(AssignmentRequirement, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AssignmentRequirement.belongsTo(Assignment);

export { AssignmentRequirement };
