import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Portfolio } from './Portfolio.model';

class PortfolioDomain extends Model<InferAttributes<PortfolioDomain>, InferCreationAttributes<PortfolioDomain>> {
  declare id: CreationOptional<string>;
  declare PortfolioId: string;
  declare domain: string;
  declare verified: CreationOptional<boolean>;
  declare verificationToken: string;
}

PortfolioDomain.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  PortfolioId: { type: DataTypes.UUID, allowNull: false, unique: true },
  domain: { type: DataTypes.STRING(300), allowNull: false, unique: true },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING(100), allowNull: false },
}, { sequelize, tableName: 'portfolio_domains' });

Portfolio.hasOne(PortfolioDomain, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
PortfolioDomain.belongsTo(Portfolio);

export { PortfolioDomain };
