import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User';

class BlogPost extends Model<InferAttributes<BlogPost>, InferCreationAttributes<BlogPost>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare slug: string;
  declare content: string;
  declare excerpt: string | null;
  declare featuredImage: string | null;
  declare authorId: string;
  declare isPublished: CreationOptional<boolean>;
  declare publishedAt: CreationOptional<Date | null>;
}

BlogPost.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  excerpt: { type: DataTypes.TEXT, allowNull: true },
  featuredImage: { type: DataTypes.STRING(500), allowNull: true },
  authorId: { type: DataTypes.UUID, allowNull: false },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  modelName: 'BlogPost',
  indexes: [{ fields: ['slug'], unique: true }, { fields: ['isPublished'] }, { fields: ['authorId'] }],
});

User.hasMany(BlogPost, { foreignKey: { name: 'authorId', allowNull: false }, onDelete: 'CASCADE' });
BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

export { BlogPost };
