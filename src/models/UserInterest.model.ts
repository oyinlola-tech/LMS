import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class UserInterest extends Model<InferAttributes<UserInterest>, InferCreationAttributes<UserInterest>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare UserId: string;
}

UserInterest.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'UserInterest' });

User.hasMany(UserInterest, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
UserInterest.belongsTo(User);

export { UserInterest };
