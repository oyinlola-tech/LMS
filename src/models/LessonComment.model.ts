import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Lesson } from './Lesson.model';
import { User } from './User.model';

class LessonComment extends Model<InferAttributes<LessonComment>, InferCreationAttributes<LessonComment>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare UserId: string;
  declare LessonId: string;
}

LessonComment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
  LessonId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'LessonComment', indexes: [{ fields: ['LessonId'] }, { fields: ['UserId'] }] });

Lesson.hasMany(LessonComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonComment.belongsTo(Lesson, { foreignKey: { name: 'LessonId', allowNull: false } });

User.hasMany(LessonComment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
LessonComment.belongsTo(User, { foreignKey: { name: 'UserId', allowNull: false } });

export { LessonComment };
