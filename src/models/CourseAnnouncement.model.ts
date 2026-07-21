import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseAnnouncement extends Model<InferAttributes<CourseAnnouncement>, InferCreationAttributes<CourseAnnouncement>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare body: string;
  declare CourseId: string;
  declare createdById: string;
}

CourseAnnouncement.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  createdById: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseAnnouncement' });

Course.hasMany(CourseAnnouncement, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseAnnouncement.belongsTo(Course);

User.hasMany(CourseAnnouncement, { foreignKey: { name: 'createdById', allowNull: false }, onDelete: 'CASCADE' });
CourseAnnouncement.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

export { CourseAnnouncement };
