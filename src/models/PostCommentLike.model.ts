import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class PostCommentLike extends Model<InferAttributes<PostCommentLike>, InferCreationAttributes<PostCommentLike>> {
  declare id: CreationOptional<string>;
  declare commentId: string;
  declare userId: string;
}

PostCommentLike.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  commentId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize, modelName: 'PostCommentLike',
  indexes: [{ fields: ['commentId'] }, { fields: ['userId'] }, { unique: true, fields: ['commentId', 'userId'] }],
});

export { PostCommentLike };
