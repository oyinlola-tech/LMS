import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class PortfolioTheme extends Model<InferAttributes<PortfolioTheme>, InferCreationAttributes<PortfolioTheme>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isPremium: CreationOptional<boolean>;
  declare presetColors: string | null;
  declare thumbnail: string | null;
  declare fontFamily: string | null;
  declare layout: string | null;
}

PortfolioTheme.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
  presetColors: { type: DataTypes.JSON, allowNull: true },
  thumbnail: { type: DataTypes.STRING(500), allowNull: true },
  fontFamily: { type: DataTypes.STRING(100), allowNull: true },
  layout: { type: DataTypes.STRING(50), allowNull: true },
}, { sequelize, tableName: 'portfolio_themes' });

export { PortfolioTheme };
