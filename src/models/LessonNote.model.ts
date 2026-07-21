import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';
import { User } from './User.model';

class LessonNote extends Model<InferAttributes<LessonNote>, InferCreationAttributes<LessonNote>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare timestampSeconds: number | null;
  declare UserId: string;
  declare LessonId: string;
}

LessonNote.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  timestampSeconds: { type: DataTypes.INTEGER, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonNote' });

User.hasMany(LessonNote, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonNote.belongsTo(User);

Lesson.hasMany(LessonNote, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonNote.belongsTo(Lesson);

export { LessonNote };
