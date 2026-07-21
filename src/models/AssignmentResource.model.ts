import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Assignment } from './Assignment.model';

class AssignmentResource extends Model<InferAttributes<AssignmentResource>, InferCreationAttributes<AssignmentResource>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare type: CreationOptional<string>;
  declare url: string | null;
  declare description: string | null;
  declare fileSize: number | null;
  declare AssignmentId: string;
}

AssignmentResource.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  type: { type: DataTypes.ENUM('file', 'video', 'link', 'documentation'), allowNull: false, defaultValue: 'file' },
  url: { type: DataTypes.STRING(500), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  fileSize: { type: DataTypes.INTEGER, allowNull: true },
  AssignmentId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'AssignmentResource' });

Assignment.hasMany(AssignmentResource, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AssignmentResource.belongsTo(Assignment);

export { AssignmentResource };
