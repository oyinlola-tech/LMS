import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Course } from './Course.model';
import { Lesson } from './Lesson.model';

class Enrollment extends Model<InferAttributes<Enrollment>, InferCreationAttributes<Enrollment>> {
  declare id: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare progressPercent: CreationOptional<number>;
  declare lastPositionSeconds: CreationOptional<number>;
  declare hoursSpent: CreationOptional<number>;
  declare pricePaid: number | null;
  declare currency: string | null;
  declare startedAt: string | null;
  declare completedAt: string | null;
  declare UserId: string;
  declare CourseId: string;
  declare lastLessonId: string | null;
}

Enrollment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM('active', 'completed', 'paused'), allowNull: false, defaultValue: 'active' },
  progressPercent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  lastPositionSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  hoursSpent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  pricePaid: { type: DataTypes.FLOAT, allowNull: true },
  currency: { type: DataTypes.STRING(10), allowNull: true },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
  lastLessonId: { type: DataTypes.UUID, allowNull: true },
}, { sequelize, modelName: 'Enrollment', indexes: [{ unique: true, fields: ['UserId', 'CourseId'] }] });

User.hasMany(Enrollment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Enrollment.belongsTo(User);

Course.hasMany(Enrollment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Enrollment.belongsTo(Course);

Lesson.hasMany(Enrollment, { foreignKey: { name: 'lastLessonId', allowNull: true } });
Enrollment.belongsTo(Lesson, { as: 'lastLesson', foreignKey: 'lastLessonId' });

export { Enrollment };
