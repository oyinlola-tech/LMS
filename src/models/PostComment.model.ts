import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Post } from './Post.model';

class PostComment extends Model<InferAttributes<PostComment>, InferCreationAttributes<PostComment>> {
  declare id: CreationOptional<string>;
  declare postId: string;
  declare userId: string;
  declare body: string;
  declare parentId: string | null;
  declare likeCount: CreationOptional<number>;
}

PostComment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false, validate: { len: [1, 2000] } },
  parentId: { type: DataTypes.UUID, allowNull: true },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  sequelize, modelName: 'PostComment',
  indexes: [{ fields: ['postId'] }, { fields: ['userId'] }, { fields: ['parentId'] }],
});

User.hasMany(PostComment, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
PostComment.belongsTo(User, { as: 'commenter', foreignKey: 'userId' });
Post.hasMany(PostComment, { foreignKey: { name: 'postId', allowNull: false }, onDelete: 'CASCADE' });
PostComment.belongsTo(Post, { foreignKey: 'postId' });

export function associate(models: any) {
  PostComment.hasMany(models.PostCommentLike, { foreignKey: 'commentId', onDelete: 'CASCADE' });
}

export { PostComment };
