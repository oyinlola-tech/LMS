import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Post } from './Post.model';

class PostLike extends Model<InferAttributes<PostLike>, InferCreationAttributes<PostLike>> {
  declare id: CreationOptional<string>;
  declare postId: string;
  declare userId: string;
}

PostLike.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize, modelName: 'PostLike',
  indexes: [{ fields: ['postId'] }, { fields: ['userId'] }, { unique: true, fields: ['postId', 'userId'] }],
});

User.hasMany(PostLike, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
PostLike.belongsTo(User, { as: 'liker', foreignKey: 'userId' });
Post.hasMany(PostLike, { foreignKey: { name: 'postId', allowNull: false }, onDelete: 'CASCADE' });
PostLike.belongsTo(Post, { foreignKey: 'postId' });

export { PostLike };
