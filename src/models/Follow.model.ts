import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Follow extends Model<InferAttributes<Follow, { omit: 'createdAt' }>, InferCreationAttributes<Follow, { omit: 'createdAt' }>> {
  declare id: CreationOptional<string>;
  declare followerId: string;
  declare followingId: string;
}

Follow.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  followerId: { type: DataTypes.UUID, allowNull: false },
  followingId: { type: DataTypes.UUID, allowNull: false },

}, {
  sequelize,
  modelName: 'Follow',
  indexes: [
    { fields: ['followerId'] },
    { fields: ['followingId'] },
    { fields: ['followerId', 'followingId'], unique: true },
  ],
});

User.hasMany(Follow, { as: 'followers', foreignKey: { name: 'followingId', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Follow, { as: 'following', foreignKey: { name: 'followerId', allowNull: false }, onDelete: 'CASCADE' });
Follow.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

export { Follow };
