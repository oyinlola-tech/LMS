import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class PasswordReset extends Model<InferAttributes<PasswordReset>, InferCreationAttributes<PasswordReset>> {
  declare id: CreationOptional<string>;
  declare tokenHash: string;
  declare expiresAt: string;
  declare usedAt: string | null;
  declare UserId: string;
}

PasswordReset.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tokenHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'PasswordReset', indexes: [{ fields: ['expiresAt'] }] });

User.hasMany(PasswordReset, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
PasswordReset.belongsTo(User);

export { PasswordReset };
