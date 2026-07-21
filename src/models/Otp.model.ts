import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Otp extends Model<InferAttributes<Otp>, InferCreationAttributes<Otp>> {
  declare id: CreationOptional<string>;
  declare codeHash: string;
  declare expiresAt: string;
  declare purpose: CreationOptional<string>;
  declare UserId: string;
}

Otp.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  codeHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  purpose: { type: DataTypes.ENUM('verify_email', 'login'), allowNull: false, defaultValue: 'verify_email' },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Otp', indexes: [{ fields: ['expiresAt'] }] });

User.hasMany(Otp, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Otp.belongsTo(User);

export { Otp };
