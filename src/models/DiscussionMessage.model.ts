import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { DiscussionGroup } from './DiscussionGroup.model';

class DiscussionMessage extends Model<InferAttributes<DiscussionMessage>, InferCreationAttributes<DiscussionMessage>> {
  declare id: CreationOptional<string>;
  declare groupId: string;
  declare authorId: string;
  declare content: string;
}

DiscussionMessage.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupId: { type: DataTypes.UUID, allowNull: false },
  authorId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  modelName: 'DiscussionMessage',
  indexes: [{ fields: ['groupId'] }, { fields: ['authorId'] }],
});

DiscussionGroup.hasMany(DiscussionMessage, { foreignKey: { name: 'groupId', allowNull: false }, onDelete: 'CASCADE' });
DiscussionMessage.belongsTo(DiscussionGroup, { foreignKey: 'groupId' });
User.hasMany(DiscussionMessage, { foreignKey: { name: 'authorId', allowNull: false }, onDelete: 'CASCADE' });
DiscussionMessage.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

export { DiscussionMessage };
