import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class EmailLog extends Model<InferAttributes<EmailLog>, InferCreationAttributes<EmailLog>> {
  declare id: CreationOptional<string>;
  declare sendbyteId: string | null;
  declare to: string;
  declare subject: string;
  declare status: CreationOptional<string>;
  declare tags: any;
  declare meta: any;
  declare sentAt: Date | null;
  declare deliveredAt: Date | null;
  declare openedAt: Date | null;
  declare clickedAt: Date | null;
  declare bouncedAt: Date | null;
  declare complainedAt: Date | null;
  declare error: string | null;
}

EmailLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sendbyteId: { type: DataTypes.STRING(120), allowNull: true, unique: true },
  to: { type: DataTypes.STRING(320), allowNull: false },
  subject: { type: DataTypes.STRING(500), allowNull: false },
  status: { type: DataTypes.STRING(50), defaultValue: 'queued' },
  tags: { type: DataTypes.JSON, allowNull: true },
  meta: { type: DataTypes.JSON, allowNull: true },
  sentAt: { type: DataTypes.DATE, allowNull: true },
  deliveredAt: { type: DataTypes.DATE, allowNull: true },
  openedAt: { type: DataTypes.DATE, allowNull: true },
  clickedAt: { type: DataTypes.DATE, allowNull: true },
  bouncedAt: { type: DataTypes.DATE, allowNull: true },
  complainedAt: { type: DataTypes.DATE, allowNull: true },
  error: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, tableName: 'email_logs', indexes: [{ fields: ['sendbyteId'] }, { fields: ['status'] }, { fields: ['to'] }] });

export { EmailLog };
