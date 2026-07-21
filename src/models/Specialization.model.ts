import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class Specialization extends Model<InferAttributes<Specialization>, InferCreationAttributes<Specialization>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare iconUrl: string | null;
  declare description: string | null;
}

Specialization.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  iconUrl: { type: DataTypes.STRING(500), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: 'Specialization' });

export { Specialization };
