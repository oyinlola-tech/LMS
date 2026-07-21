import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseCertificate extends Model<InferAttributes<CourseCertificate>, InferCreationAttributes<CourseCertificate>> {
  declare id: CreationOptional<string>;
  declare certificateUrl: string;
  declare issuedAt: CreationOptional<string>;
  declare UserId: string;
  declare CourseId: string;
}

CourseCertificate.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  certificateUrl: { type: DataTypes.STRING(500), allowNull: false },
  issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseCertificate' });

Course.hasMany(CourseCertificate, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseCertificate.belongsTo(Course);

User.hasMany(CourseCertificate, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseCertificate.belongsTo(User);

export { CourseCertificate };
