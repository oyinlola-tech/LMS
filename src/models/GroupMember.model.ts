import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { DiscussionGroup } from './DiscussionGroup.model';

class GroupMember extends Model<InferAttributes<GroupMember>, InferCreationAttributes<GroupMember>> {
  declare id: CreationOptional<string>;
  declare groupId: string;
  declare userId: string;
  declare role: CreationOptional<'admin' | 'moderator' | 'member'>;
  declare joinedAt: CreationOptional<Date>;
}

GroupMember.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'moderator', 'member'), allowNull: false, defaultValue: 'member' },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'GroupMember',
  indexes: [{ fields: ['groupId'] }, { fields: ['userId'] }, { fields: ['groupId', 'userId'], unique: true }],
});

DiscussionGroup.hasMany(GroupMember, { foreignKey: { name: 'groupId', allowNull: false }, onDelete: 'CASCADE' });
GroupMember.belongsTo(DiscussionGroup, { foreignKey: 'groupId' });
User.hasMany(GroupMember, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
GroupMember.belongsTo(User, { as: 'member', foreignKey: 'userId' });

export { GroupMember };
