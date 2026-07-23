import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class BlogComment extends Model<InferAttributes<BlogComment>, InferCreationAttributes<BlogComment>> {
  declare id: CreationOptional<string>;
  declare blogPostId: string;
  declare authorId: string;
  declare content: string;
  declare flagged: CreationOptional<boolean>;
}

BlogComment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  blogPostId: { type: DataTypes.UUID, allowNull: false, references: { model: 'BlogPosts', key: 'id' }, onDelete: 'CASCADE' },
  authorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
  content: { type: DataTypes.TEXT, allowNull: false },
  flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  modelName: 'BlogComment',
  indexes: [{ fields: ['blogPostId'] }, { fields: ['authorId'] }],
});

User.hasMany(BlogComment, { foreignKey: { name: 'authorId', allowNull: false }, onDelete: 'CASCADE' });
BlogComment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

export { BlogComment };
