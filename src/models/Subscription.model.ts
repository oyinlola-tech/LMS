import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Subscription extends Model<InferAttributes<Subscription>, InferCreationAttributes<Subscription>> {
  declare id: CreationOptional<string>;
  declare plan: string;
  declare status: CreationOptional<string>;
  declare provider: string | null;
  declare externalId: string | null;
  declare startedAt: string | null;
  declare endsAt: string | null;
  declare UserId: string;
}

Subscription.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  plan: { type: DataTypes.STRING(60), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'canceled', 'past_due'), allowNull: false, defaultValue: 'active' },
  provider: { type: DataTypes.STRING(60), allowNull: true },
  externalId: { type: DataTypes.STRING(120), allowNull: true },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  endsAt: { type: DataTypes.DATE, allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Subscription', indexes: [{ fields: ['UserId'] }, { fields: ['status'] }] });

User.hasMany(Subscription, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Subscription.belongsTo(User);

export { Subscription };
