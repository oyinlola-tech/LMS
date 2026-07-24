import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import crypto from 'crypto';

class UserMarketingPreference extends Model<InferAttributes<UserMarketingPreference>, InferCreationAttributes<UserMarketingPreference>> {
  declare userId: string;
  declare optOut: boolean;
  declare frequency: string;
  declare lastSentAt: Date | null;
  declare unsubscribeToken: string | null;
}

UserMarketingPreference.init({
  userId: { type: DataTypes.UUID, primaryKey: true },
  optOut: { type: DataTypes.BOOLEAN, defaultValue: false },
  frequency: { type: DataTypes.STRING(20), defaultValue: 'weekly', allowNull: false },
  lastSentAt: { type: DataTypes.DATE, allowNull: true },
  unsubscribeToken: { type: DataTypes.STRING(120), allowNull: true, unique: true },
}, { sequelize, tableName: 'user_marketing_preferences' });

User.hasOne(UserMarketingPreference, { as: 'marketingPreference', foreignKey: 'userId', onDelete: 'CASCADE' });
UserMarketingPreference.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export function generateMarketingToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export { UserMarketingPreference };
