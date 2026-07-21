import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string | null;
  declare descriptionHtml: string | null;
  declare categories: object | null;
  declare learningObjectives: object | null;
  declare thumbnailUrl: string | null;
  declare difficulty: CreationOptional<string>;
  declare totalHours: CreationOptional<number>;
  declare totalLessons: CreationOptional<number>;
  declare durationWeeks: number | null;
  declare startDate: string | null;
  declare waitlistCount: CreationOptional<number>;
  declare price: number | null;
  declare previousPrice: number | null;
  declare currency: CreationOptional<string>;
  declare perks: object | null;
  declare isPublished: CreationOptional<boolean>;
  declare tutorId: string;
}

Course.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  descriptionHtml: { type: DataTypes.TEXT, allowNull: true },
  categories: { type: DataTypes.JSON, allowNull: true },
  learningObjectives: { type: DataTypes.JSON, allowNull: true },
  thumbnailUrl: { type: DataTypes.STRING(500), allowNull: true },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'expert'), allowNull: false, defaultValue: 'beginner' },
  totalHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  totalLessons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  durationWeeks: { type: DataTypes.INTEGER, allowNull: true },
  startDate: { type: DataTypes.DATE, allowNull: true },
  waitlistCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  price: { type: DataTypes.FLOAT, allowNull: true },
  previousPrice: { type: DataTypes.FLOAT, allowNull: true },
  currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: process.env.DEFAULT_CURRENCY || 'USD' },
  perks: { type: DataTypes.JSON, allowNull: true },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  tutorId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Course', indexes: [{ fields: ['difficulty'] }, { fields: ['isPublished'] }] });

User.hasMany(Course, { foreignKey: { name: 'tutorId', allowNull: false }, onDelete: 'CASCADE' });
Course.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

export { Course };
