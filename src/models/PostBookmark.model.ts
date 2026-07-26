import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Post } from './Post.model';

class PostBookmark extends Model<InferAttributes<PostBookmark>, InferCreationAttributes<PostBookmark>> {
  declare id: CreationOptional<string>;
  declare postId: string;
  declare userId: string;
}

PostBookmark.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize, modelName: 'PostBookmark',
  indexes: [{ fields: ['postId'] }, { fields: ['userId'] }, { unique: true, fields: ['postId', 'userId'] }],
});

User.hasMany(PostBookmark, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
PostBookmark.belongsTo(User, { as: 'bookmarker', foreignKey: 'userId' });
Post.hasMany(PostBookmark, { foreignKey: { name: 'postId', allowNull: false }, onDelete: 'CASCADE' });
PostBookmark.belongsTo(Post, { foreignKey: 'postId' });

export { PostBookmark };
