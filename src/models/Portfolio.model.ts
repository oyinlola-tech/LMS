import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { PortfolioTheme } from './PortfolioTheme.model';
import { PortfolioPlan } from './PortfolioPlan.model';

class Portfolio extends Model<InferAttributes<Portfolio>, InferCreationAttributes<Portfolio>> {
  declare id: CreationOptional<string>;
  declare UserId: string;
  declare headline: string | null;
  declare bio: string | null;
  declare skills: string | null;
  declare socialLinks: string | null;
  declare certifications: string | null;
  declare education: string | null;
  declare experience: string | null;
  declare completedCourses: string | null;
  declare isPublic: CreationOptional<boolean>;
  declare slug: string | null;
  declare themeId: string | null;
  declare customColors: string | null;
  declare planId: string | null;
  declare planExpiresAt: string | null;
  declare images: string | null;
}

Portfolio.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  UserId: { type: DataTypes.UUID, allowNull: false, unique: true },
  headline: { type: DataTypes.STRING(200), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.JSON, allowNull: true },
  socialLinks: { type: DataTypes.JSON, allowNull: true },
  certifications: { type: DataTypes.JSON, allowNull: true },
  education: { type: DataTypes.JSON, allowNull: true },
  experience: { type: DataTypes.JSON, allowNull: true },
  completedCourses: { type: DataTypes.JSON, allowNull: true },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  slug: { type: DataTypes.STRING(200), allowNull: true, unique: true },
  themeId: { type: DataTypes.UUID, allowNull: true },
  customColors: { type: DataTypes.JSON, allowNull: true },
  planId: { type: DataTypes.UUID, allowNull: true },
  planExpiresAt: { type: DataTypes.DATE, allowNull: true },
  images: { type: DataTypes.JSON, allowNull: true },
}, { sequelize, tableName: 'portfolios', indexes: [{ unique: true, fields: ['slug'] }] });

User.hasOne(Portfolio, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Portfolio.belongsTo(User);
Portfolio.belongsTo(PortfolioTheme, { foreignKey: 'themeId', as: 'theme' });
Portfolio.belongsTo(PortfolioPlan, { foreignKey: 'planId', as: 'plan' });

export { Portfolio };
