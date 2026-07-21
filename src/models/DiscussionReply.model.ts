import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { DiscussionThread } from './DiscussionThread.model';

class DiscussionReply extends Model<InferAttributes<DiscussionReply>, InferCreationAttributes<DiscussionReply>> {
  declare id: CreationOptional<string>;
  declare body: string;
  declare DiscussionThreadId: string;
  declare UserId: string;
}

DiscussionReply.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  body: { type: DataTypes.TEXT, allowNull: false },

  DiscussionThreadId: { type: DataTypes.UUID, allowNull: false },
  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'DiscussionReply', indexes: [{ fields: ['DiscussionThreadId'] }, { fields: ['UserId'] }] });

DiscussionThread.hasMany(DiscussionReply, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
DiscussionReply.belongsTo(DiscussionThread);

User.hasMany(DiscussionReply, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
DiscussionReply.belongsTo(User);

export { DiscussionReply };
