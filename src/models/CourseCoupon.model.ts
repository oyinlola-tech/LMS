import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';

class CourseCoupon extends Model<InferAttributes<CourseCoupon>, InferCreationAttributes<CourseCoupon>> {
  declare id: CreationOptional<string>;
  declare code: string;
  declare discountPercent: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare expiresAt: string | null;
  declare CourseId: string;
}

CourseCoupon.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: false },
  discountPercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  expiresAt: { type: DataTypes.DATE, allowNull: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseCoupon' });

Course.hasMany(CourseCoupon, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseCoupon.belongsTo(Course);

export { CourseCoupon };
