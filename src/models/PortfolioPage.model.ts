import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Portfolio } from './Portfolio.model';

class PortfolioPage extends Model<InferAttributes<PortfolioPage>, InferCreationAttributes<PortfolioPage>> {
  declare id: CreationOptional<string>;
  declare PortfolioId: string;
  declare title: string;
  declare slug: string;
  declare type: CreationOptional<string>;
  declare content: string | null;
  declare order: CreationOptional<number>;
  declare isVisible: CreationOptional<boolean>;
}

PortfolioPage.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  PortfolioId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false },
  type: { type: DataTypes.STRING(20), defaultValue: 'custom' },
  content: { type: DataTypes.JSON, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { sequelize, tableName: 'portfolio_pages', indexes: [{ unique: true, fields: ['PortfolioId', 'slug'] }] });

Portfolio.hasMany(PortfolioPage, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
PortfolioPage.belongsTo(Portfolio);

export { PortfolioPage };
