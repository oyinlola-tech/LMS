import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { CourseSection } from './CourseSection.model';
import { Course } from './Course.model';

class Lesson extends Model<InferAttributes<Lesson>, InferCreationAttributes<Lesson>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare type: CreationOptional<string>;
  declare durationMinutes: CreationOptional<number>;
  declare videoUrl: string | null;
  declare transcriptUrl: string | null;
  declare pdfPages: number | null;
  declare quizDueDate: string | null;
  declare position: CreationOptional<number>;
  declare isPreview: CreationOptional<boolean>;
  declare courseSectionId: string;
  declare courseId: string;
}

Lesson.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  type: { type: DataTypes.ENUM('video', 'pdf', 'quiz', 'note'), allowNull: false, defaultValue: 'video' },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  videoUrl: { type: DataTypes.STRING(500), allowNull: true },
  transcriptUrl: { type: DataTypes.STRING(500), allowNull: true },
  pdfPages: { type: DataTypes.INTEGER, allowNull: true, validate: { isValidForType(value: number | null | undefined) { const lessonType = this.getDataValue('type'); if (value !== null && value !== undefined && lessonType !== 'pdf') { throw new Error("pdfPages can only be set when lesson type is 'pdf'"); } } } },
  quizDueDate: { type: DataTypes.DATE, allowNull: true, validate: { isValidForType(value: string | null | undefined) { if (value !== null && value !== undefined && (this as any).type !== 'quiz') { throw new Error("quizDueDate can only be set when lesson type is 'quiz'"); } } } },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isPreview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  courseSectionId: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Lesson' });

CourseSection.hasMany(Lesson, { foreignKey: { name: 'courseSectionId', allowNull: false }, onDelete: 'CASCADE' });
Lesson.belongsTo(CourseSection, { foreignKey: 'courseSectionId' });

Course.hasMany(Lesson, { foreignKey: { name: 'courseId', allowNull: false }, onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

export { Lesson };
