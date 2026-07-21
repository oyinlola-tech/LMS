import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class DiscussionGroup extends Model<InferAttributes<DiscussionGroup>, InferCreationAttributes<DiscussionGroup>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string | null;
  declare coverImage: string | null;
  declare createdById: string;
  declare courseId: string | null;
  declare isPublic: CreationOptional<boolean>;
}

DiscussionGroup.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  coverImage: { type: DataTypes.STRING(500), allowNull: true },
  createdById: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: true },
  isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  sequelize,
  modelName: 'DiscussionGroup',
  indexes: [{ fields: ['isPublic'] }, { fields: ['createdById'] }, { fields: ['courseId'] }],
});

User.hasMany(DiscussionGroup, { foreignKey: { name: 'createdById', allowNull: false }, onDelete: 'CASCADE' });
DiscussionGroup.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });

export { DiscussionGroup };
