import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Assignment } from './Assignment.model';

class GradingRubricCriterion extends Model<InferAttributes<GradingRubricCriterion>, InferCreationAttributes<GradingRubricCriterion>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string | null;
  declare weight: CreationOptional<number>;
  declare maxScore: number | null;
  declare AssignmentId: string;
}

GradingRubricCriterion.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  weight: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  maxScore: { type: DataTypes.INTEGER, allowNull: true },
  AssignmentId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'GradingRubricCriterion' });

Assignment.hasMany(GradingRubricCriterion, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
GradingRubricCriterion.belongsTo(Assignment);

export { GradingRubricCriterion };
