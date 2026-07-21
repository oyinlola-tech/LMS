import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseReview extends Model<InferAttributes<CourseReview>, InferCreationAttributes<CourseReview>> {
  declare id: CreationOptional<string>;
  declare rating: number;
  declare comment: string | null;
  declare consentToFeature: CreationOptional<boolean>;
  declare CourseId: string;
  declare UserId: string;
}

CourseReview.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
  consentToFeature: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseReview', indexes: [{ unique: true, fields: ['CourseId', 'UserId'] }] });

Course.hasMany(CourseReview, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseReview.belongsTo(Course);

User.hasMany(CourseReview, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseReview.belongsTo(User);

export { CourseReview };
