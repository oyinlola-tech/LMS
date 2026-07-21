import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';

class LessonResource extends Model<InferAttributes<LessonResource>, InferCreationAttributes<LessonResource>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare resourceUrl: string;
  declare fileType: string | null;
  declare fileSizeMb: number | null;
  declare LessonId: string;
}

LessonResource.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  resourceUrl: { type: DataTypes.STRING(500), allowNull: false },
  fileType: { type: DataTypes.STRING(50), allowNull: true },
  fileSizeMb: { type: DataTypes.FLOAT, allowNull: true },

  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonResource' });

Lesson.hasMany(LessonResource, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonResource.belongsTo(Lesson);

export { LessonResource };
