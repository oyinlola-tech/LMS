import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class PostReport extends Model<InferAttributes<PostReport>, InferCreationAttributes<PostReport>> {
  declare id: CreationOptional<string>;
  declare postId: string | null;
  declare commentId: string | null;
  declare reporterId: string;
  declare reason: string;
  declare status: CreationOptional<string>;
}

PostReport.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: true },
  commentId: { type: DataTypes.UUID, allowNull: true },
  reporterId: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'resolved', 'dismissed'), defaultValue: 'open' },
}, {
  sequelize, modelName: 'PostReport',
  indexes: [{ fields: ['postId'] }, { fields: ['commentId'] }, { fields: ['reporterId'] }],
});

User.hasMany(PostReport, { foreignKey: { name: 'reporterId', allowNull: false }, onDelete: 'CASCADE' });
PostReport.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });

export { PostReport };
