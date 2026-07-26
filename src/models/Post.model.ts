import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<string>;
  declare body: string;
  declare imageUrl: string | null;
  declare userId: string;
  declare isPinned: CreationOptional<boolean>;
  declare likeCount: CreationOptional<number>;
  declare commentCount: CreationOptional<number>;
  declare bookmarkCount: CreationOptional<number>;
  declare tags: CreationOptional<string[]>;
}

Post.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  body: { type: DataTypes.TEXT, allowNull: false, validate: { len: [1, 5000] } },
  imageUrl: { type: DataTypes.STRING(500), allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  bookmarkCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING(50)), defaultValue: [] },
}, {
  sequelize, modelName: 'Post',
  indexes: [{ fields: ['userId'] }, { fields: ['createdAt'] }, { fields: ['tags'] }],
});

User.hasMany(Post, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });

export function associate(models: any) {
  Post.hasMany(models.PostLike, { foreignKey: 'postId', onDelete: 'CASCADE' });
  Post.hasMany(models.PostComment, { foreignKey: 'postId', onDelete: 'CASCADE' });
  Post.hasMany(models.PostBookmark, { foreignKey: 'postId', onDelete: 'CASCADE' });
}

export { Post };
