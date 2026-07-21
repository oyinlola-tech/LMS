import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class CourseEvent extends Model<InferAttributes<CourseEvent>, InferCreationAttributes<CourseEvent>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string | null;
  declare startsAt: string;
  declare endsAt: string | null;
  declare meetingUrl: string | null;
  declare CourseId: string;
  declare createdById: string;
}

CourseEvent.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  startsAt: { type: DataTypes.DATE, allowNull: false },
  endsAt: { type: DataTypes.DATE, allowNull: true },
  meetingUrl: { type: DataTypes.STRING(500), allowNull: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  createdById: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseEvent' });

Course.hasMany(CourseEvent, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CourseEvent.belongsTo(Course);

User.hasMany(CourseEvent, { foreignKey: { name: 'createdById', allowNull: false }, onDelete: 'CASCADE' });
CourseEvent.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

export { CourseEvent };
