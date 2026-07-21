import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseComment extends Model<InferAttributes<CourseComment>, InferCreationAttributes<CourseComment>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare CourseId: string;
  declare UserId: string;
}

CourseComment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseComment' });

Course.hasMany(CourseComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseComment.belongsTo(Course);

User.hasMany(CourseComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseComment.belongsTo(User);

export { CourseComment };
