import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

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
}, { sequelize, tableName: 'portfolios' });

User.hasOne(Portfolio, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Portfolio.belongsTo(User);

export { Portfolio };
