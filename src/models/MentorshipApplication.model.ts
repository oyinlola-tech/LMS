import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Course } from './Course.model';

class MentorshipApplication extends Model<InferAttributes<MentorshipApplication>, InferCreationAttributes<MentorshipApplication>> {
  declare id: CreationOptional<string>;
  declare message: string | null;
  declare status: CreationOptional<string>;
  declare UserId: string;
  declare CourseId: string;
  declare certificationRequirements: string | null;
  declare portfolioUrl: string | null;
  declare category: string | null;
}

MentorshipApplication.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
  certificationRequirements: { type: DataTypes.TEXT, allowNull: true },
  portfolioUrl: { type: DataTypes.STRING(500), allowNull: true },
  category: { type: DataTypes.STRING(100), allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'MentorshipApplication', indexes: [{ unique: true, fields: ['UserId', 'CourseId'] }, { fields: ['status'] }] });

User.hasMany(MentorshipApplication, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
MentorshipApplication.belongsTo(User);

Course.hasMany(MentorshipApplication, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
MentorshipApplication.belongsTo(Course);

export { MentorshipApplication };
