import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Portfolio } from './Portfolio.model';

class PortfolioContact extends Model<InferAttributes<PortfolioContact>, InferCreationAttributes<PortfolioContact>> {
  declare id: CreationOptional<string>;
  declare PortfolioId: string;
  declare name: string;
  declare email: string;
  declare message: string;
  declare read: CreationOptional<boolean>;
}

PortfolioContact.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  PortfolioId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'portfolio_contacts' });

Portfolio.hasMany(PortfolioContact, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
PortfolioContact.belongsTo(Portfolio);

export { PortfolioContact };
