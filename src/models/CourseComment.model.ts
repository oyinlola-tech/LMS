import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseComment extends Model<InferAttributes<CourseComment>, InferCreationAttributes<CourseComment>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare parentId: string | null;
  declare CourseId: string;
  declare UserId: string;
}

CourseComment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  parentId: { type: DataTypes.UUID, allowNull: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseComment', indexes: [{ fields: ['parentId'] }, { fields: ['CourseId'] }] });

Course.hasMany(CourseComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseComment.belongsTo(Course);

User.hasMany(CourseComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseComment.belongsTo(User);

CourseComment.belongsTo(CourseComment, { as: 'parent', foreignKey: 'parentId' });
CourseComment.hasMany(CourseComment, { as: 'replies', foreignKey: 'parentId' });

export { CourseComment };
