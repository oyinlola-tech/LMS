import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Portfolio } from './Portfolio.model';

class PortfolioReview extends Model<InferAttributes<PortfolioReview>, InferCreationAttributes<PortfolioReview>> {
  declare id: CreationOptional<string>;
  declare PortfolioId: string;
  declare reviewerName: string;
  declare reviewerEmail: string | null;
  declare reviewerAvatar: string | null;
  declare rating: number;
  declare title: string | null;
  declare content: string | null;
  declare isApproved: CreationOptional<boolean>;
}

PortfolioReview.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  PortfolioId: { type: DataTypes.UUID, allowNull: false },
  reviewerName: { type: DataTypes.STRING(200), allowNull: false },
  reviewerEmail: { type: DataTypes.STRING(200), allowNull: true },
  reviewerAvatar: { type: DataTypes.STRING(500), allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING(200), allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: true },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'portfolio_reviews' });

Portfolio.hasMany(PortfolioReview, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
PortfolioReview.belongsTo(Portfolio);

export { PortfolioReview };
