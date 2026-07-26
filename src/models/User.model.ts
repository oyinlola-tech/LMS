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
  declare appleId: string | null;
  declare status: CreationOptional<string>;
  declare phoneNumber: string | null;
  declare location: string | null;
  declare team: string | null;
  declare studentId: string | null;
  declare tutorId: string | null;
  declare adminId: string | null;
  declare isVerified: CreationOptional<boolean>;
  declare checkmarkType: CreationOptional<string | null>;
  declare isPrivate: CreationOptional<boolean>;
  declare coverUrl: string | null;
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
  role: { type: DataTypes.ENUM('learner', 'tutor', 'admin', 'super_admin'), allowNull: false, defaultValue: 'learner' },
  bio: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.JSON, allowNull: true },
  avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
  isEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  googleId: { type: DataTypes.STRING(191), allowNull: true },
  githubId: { type: DataTypes.STRING(191), allowNull: true },
  appleId: { type: DataTypes.STRING(191), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'suspended', 'deactivated'), allowNull: false, defaultValue: 'active' },
  phoneNumber: { type: DataTypes.STRING(40), allowNull: true },
  location: { type: DataTypes.STRING(120), allowNull: true },
  team: { type: DataTypes.STRING(120), allowNull: true },
  studentId: { type: DataTypes.STRING(30), allowNull: true, unique: true, comment: 'Unique student/matric number for learners' },
  tutorId: { type: DataTypes.STRING(30), allowNull: true, unique: true, comment: 'Unique tutor ID number' },
  adminId: { type: DataTypes.STRING(30), allowNull: true, unique: true, comment: 'Unique admin ID number' },
  isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: 'Checkmark verification status' },
  checkmarkType: { type: DataTypes.STRING(10), allowNull: true, comment: 'blue for tutors, black for admin/superadmin' },
  isPrivate: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: 'Profile privacy setting' },
  coverUrl: { type: DataTypes.STRING(500), allowNull: true, comment: 'Cover photo URL' },
  isLegacyUser: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, comment: 'True for existing users - no login OTP required. New users get false.' },
  trustedDeviceHash: { type: DataTypes.STRING(255), allowNull: true, comment: 'Hash of trusted device for login OTP' },
  trustedIp: { type: DataTypes.STRING(45), allowNull: true, comment: 'Trusted IP address for login OTP' },
  fcmToken: { type: DataTypes.STRING(500), allowNull: true, comment: 'Firebase Cloud Messaging token' },
}, { sequelize, modelName: 'User', indexes: [{ unique: true, fields: ['email'] }, { unique: true, fields: ['studentId'] }, { unique: true, fields: ['tutorId'] }, { unique: true, fields: ['adminId'] }, { fields: ['googleId'] }, { fields: ['githubId'] }, { fields: ['appleId'] }] });

export function associate(models: any) {
  User.hasMany(models.MessageThread, { foreignKey: { name: 'userAId', allowNull: false }, onDelete: 'CASCADE' });
  User.hasMany(models.MessageThread, { foreignKey: { name: 'userBId', allowNull: false }, onDelete: 'CASCADE' });
  User.hasMany(models.Message, { foreignKey: { name: 'senderId', allowNull: false }, onDelete: 'CASCADE' });
}

export { User };
