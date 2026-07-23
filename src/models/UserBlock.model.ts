import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserBlock extends Model<InferAttributes<UserBlock>, InferCreationAttributes<UserBlock>> {
  declare id: CreationOptional<string>;
  declare blockerId: string;
  declare blockedId: string;
}

UserBlock.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  blockerId: { type: DataTypes.UUID, allowNull: false },
  blockedId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, tableName: 'user_blocks', indexes: [{ unique: true, fields: ['blockerId', 'blockedId'] }] });

User.hasMany(UserBlock, { as: 'blocks', foreignKey: 'blockerId', onDelete: 'CASCADE' });
UserBlock.belongsTo(User, { as: 'blocker', foreignKey: 'blockerId' });
User.hasMany(UserBlock, { as: 'blockedBy', foreignKey: 'blockedId', onDelete: 'CASCADE' });
UserBlock.belongsTo(User, { as: 'blocked', foreignKey: 'blockedId' });

export { UserBlock };
