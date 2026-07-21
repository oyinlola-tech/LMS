import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { DiscussionGroup } from './DiscussionGroup.model';

class ThreadSubscription extends Model<InferAttributes<ThreadSubscription>, InferCreationAttributes<ThreadSubscription>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare groupId: string;
}

ThreadSubscription.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  groupId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize,
  modelName: 'ThreadSubscription',
  indexes: [{ fields: ['userId'] }, { fields: ['groupId'] }, { fields: ['userId', 'groupId'], unique: true }],
});

User.hasMany(ThreadSubscription, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
ThreadSubscription.belongsTo(User, { foreignKey: 'userId' });
DiscussionGroup.hasMany(ThreadSubscription, { foreignKey: { name: 'groupId', allowNull: false }, onDelete: 'CASCADE' });
ThreadSubscription.belongsTo(DiscussionGroup, { foreignKey: 'groupId' });

export { ThreadSubscription };
