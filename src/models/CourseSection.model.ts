import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';

class CourseSection extends Model<InferAttributes<CourseSection>, InferCreationAttributes<CourseSection>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare position: CreationOptional<number>;
  declare CourseId: string;
}

CourseSection.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseSection' });

Course.hasMany(CourseSection, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseSection.belongsTo(Course);

export { CourseSection };
