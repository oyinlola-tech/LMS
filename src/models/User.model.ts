import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare fullName: string;
  declare email: string;
  declare passwordHash: string | null;
  declare role: CreationOptional<string>;
  declare bio: string | null;
  declare skills: object | null;
  declare avatarUrl: string | null;
  declare isEmailVerified: CreationOptional<boolean>;
  declare googleId: string | null;
  declare githubId: string | null;
  declare status: CreationOptional<string>;
  declare phoneNumber: string | null;
  declare location: string | null;
  declare team: string | null;
  declare isLegacyUser: CreationOptional<boolean>;
  declare trustedDeviceHash: string | null;
  declare trustedIp: string | null;
  declare fcmToken: string | null;
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: true },
  role: { type: DataTypes.ENUM('learner', 'tutor', 'admin'), allowNull: false, defaultValue: 'learner' },
  bio: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.JSON, allowNull: true },
  avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
  isEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  googleId: { type: DataTypes.STRING(191), allowNull: true },
  githubId: { type: DataTypes.STRING(191), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'suspended', 'deactivated'), allowNull: false, defaultValue: 'active' },
  phoneNumber: { type: DataTypes.STRING(40), allowNull: true },
  location: { type: DataTypes.STRING(120), allowNull: true },
  team: { type: DataTypes.STRING(120), allowNull: true },
  isLegacyUser: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, comment: 'True for existing users - no login OTP required. New users get false.' },
  trustedDeviceHash: { type: DataTypes.STRING(255), allowNull: true, comment: 'Hash of trusted device for login OTP' },
  trustedIp: { type: DataTypes.STRING(45), allowNull: true, comment: 'Trusted IP address for login OTP' },
  fcmToken: { type: DataTypes.STRING(500), allowNull: true, comment: 'Firebase Cloud Messaging token' },
}, { sequelize, modelName: 'User', indexes: [{ unique: true, fields: ['email'] }, { fields: ['googleId'] }, { fields: ['githubId'] }] });

export function associate(models: any) {
  User.hasMany(models.MessageThread, { foreignKey: { name: 'userAId', allowNull: false }, onDelete: 'CASCADE' });
  User.hasMany(models.MessageThread, { foreignKey: { name: 'userBId', allowNull: false }, onDelete: 'CASCADE' });
  User.hasMany(models.Message, { foreignKey: { name: 'senderId', allowNull: false }, onDelete: 'CASCADE' });
}

export { User };
