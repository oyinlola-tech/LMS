import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserAdminNote extends Model<InferAttributes<UserAdminNote>, InferCreationAttributes<UserAdminNote>> {
  declare id: CreationOptional<string>;
  declare note: string;
  declare UserId: string;
  declare adminId: string;
}

UserAdminNote.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  note: { type: DataTypes.TEXT, allowNull: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
  adminId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'UserAdminNote', indexes: [{ fields: ['UserId'] }, { fields: ['adminId'] }] });

User.hasMany(UserAdminNote, { foreignKey: { name: 'UserId', allowNull: false }, onDelete: 'CASCADE' });
UserAdminNote.belongsTo(User, { foreignKey: 'UserId' });
UserAdminNote.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });

export { UserAdminNote };
