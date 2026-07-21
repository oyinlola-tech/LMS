import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';
import { User } from './User.model';

class LessonBookmark extends Model<InferAttributes<LessonBookmark>, InferCreationAttributes<LessonBookmark>> {
  declare id: CreationOptional<string>;
  declare note: string | null;
  declare timestampSeconds: number | null;
  declare UserId: string;
  declare LessonId: string;
}

LessonBookmark.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  note: { type: DataTypes.STRING(200), allowNull: true },
  timestampSeconds: { type: DataTypes.INTEGER, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonBookmark' });

User.hasMany(LessonBookmark, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonBookmark.belongsTo(User);

Lesson.hasMany(LessonBookmark, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonBookmark.belongsTo(Lesson);

export { LessonBookmark };
