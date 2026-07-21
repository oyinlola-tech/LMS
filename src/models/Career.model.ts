import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

export type CareerType = 'full-time' | 'part-time' | 'contract' | 'internship';

class Career extends Model<InferAttributes<Career>, InferCreationAttributes<Career>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare location: string | null;
  declare type: CareerType;
  declare description: string;
  declare isActive: CreationOptional<boolean>;
}

Career.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  location: { type: DataTypes.STRING(100), allowNull: true },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    allowNull: false,
    defaultValue: 'full-time',
  },
  description: { type: DataTypes.TEXT, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, modelName: 'Career', indexes: [{ fields: ['isActive'] }] });

export { Career };
