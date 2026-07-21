import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { User } from './User.model';

class OfficeHour extends Model<InferAttributes<OfficeHour>, InferCreationAttributes<OfficeHour>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare startsAt: string;
  declare durationMinutes: number | null;
  declare meetingUrl: string | null;
  declare CourseId: string;
  declare tutorId: string;
}

OfficeHour.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  startsAt: { type: DataTypes.DATE, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: true },
  meetingUrl: { type: DataTypes.STRING(500), allowNull: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  tutorId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'OfficeHour' });

Course.hasMany(OfficeHour, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
OfficeHour.belongsTo(Course);

User.hasMany(OfficeHour, { foreignKey: { name: 'tutorId', allowNull: false }, onDelete: 'CASCADE' });
OfficeHour.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

export { OfficeHour };
