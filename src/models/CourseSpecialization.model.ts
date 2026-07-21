import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { Specialization } from './Specialization.model';

class CourseSpecialization extends Model<InferAttributes<CourseSpecialization>, InferCreationAttributes<CourseSpecialization>> {
  declare id: CreationOptional<string>;
  declare CourseId: string;
  declare SpecializationId: string;
}

CourseSpecialization.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  SpecializationId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'CourseSpecialization' });

Course.belongsToMany(Specialization, { through: CourseSpecialization });
Specialization.belongsToMany(Course, { through: CourseSpecialization });

export { CourseSpecialization };
