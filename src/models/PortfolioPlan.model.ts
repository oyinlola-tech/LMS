import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class PortfolioPlan extends Model<InferAttributes<PortfolioPlan>, InferCreationAttributes<PortfolioPlan>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare price: number;
  declare currency: CreationOptional<string>;
  declare features: string | null;
  declare isActive: CreationOptional<boolean>;
}

PortfolioPlan.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  features: { type: DataTypes.JSON, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'portfolio_plans' });

export { PortfolioPlan };
