import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Milestone extends Model<InferAttributes<Milestone>, InferCreationAttributes<Milestone>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare dueDate: string | null;
  declare completedAt: string | null;
  declare UserId: string;
}

Milestone.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Milestone' });

User.hasMany(Milestone, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Milestone.belongsTo(User);

export { Milestone };
