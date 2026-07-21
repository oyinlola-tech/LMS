import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

class MessageThread extends Model<InferAttributes<MessageThread>, InferCreationAttributes<MessageThread>> {
  declare id: CreationOptional<string>;
  declare subject: string | null;
  declare lastMessageAt: string | null;
  declare userAId: string;
  declare userBId: string;
}

MessageThread.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  subject: { type: DataTypes.STRING(191), allowNull: true },
  lastMessageAt: { type: DataTypes.DATE, allowNull: true },

  userAId: { type: DataTypes.UUID, allowNull: false },
  userBId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'MessageThread', indexes: [{ fields: ['userAId'] }, { fields: ['userBId'] }, { fields: ['lastMessageAt'] }] });

export function associate(models: any) {
  MessageThread.belongsTo(models.User, { as: 'userA', foreignKey: 'userAId' });
  MessageThread.belongsTo(models.User, { as: 'userB', foreignKey: 'userBId' });
}

export { MessageThread };
