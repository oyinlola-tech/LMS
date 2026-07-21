import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class PayoutRequest extends Model<{
  id: string;
  tutorId: string;
  amount: number;
  currency: string;
  status: string;
  adminNote: string | null;
  approvedAt: Date | null;
  approvedById: string | null;
}> {
  declare id: string;
  declare tutorId: string;
  declare amount: number;
  declare currency: string;
  declare status: string;
  declare adminNote: string | null;
  declare approvedAt: Date | null;
  declare approvedById: string | null;
}

PayoutRequest.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tutorId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  adminNote: { type: DataTypes.TEXT, allowNull: true },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  approvedById: { type: DataTypes.UUID, allowNull: true, references: { model: User, key: 'id' } },
}, {
  sequelize,
  tableName: 'payout_requests',
  timestamps: true,
});

PayoutRequest.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });
PayoutRequest.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

export { PayoutRequest };
