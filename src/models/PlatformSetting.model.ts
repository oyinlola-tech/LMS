import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.config';

class PlatformSetting extends Model<{ key: string; value: string }> {
  declare key: string;
  declare value: string;
}

PlatformSetting.init({
  key: { type: DataTypes.STRING(100), primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  tableName: 'platform_settings',
  timestamps: true,
});

export { PlatformSetting };
