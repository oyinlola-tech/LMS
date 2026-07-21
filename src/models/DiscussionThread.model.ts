import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Course } from './Course.model';

class DiscussionThread extends Model<InferAttributes<DiscussionThread>, InferCreationAttributes<DiscussionThread>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare body: string;
  declare UserId: string;
  declare CourseId: string;
}

DiscussionThread.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'DiscussionThread', indexes: [{ fields: ['CourseId'] }, { fields: ['UserId'] }] });

User.hasMany(DiscussionThread, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
DiscussionThread.belongsTo(User);

Course.hasMany(DiscussionThread, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
DiscussionThread.belongsTo(Course);

export { DiscussionThread };
