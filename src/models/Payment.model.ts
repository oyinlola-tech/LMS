import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Course } from './Course.model';

class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare UserId: string;
  declare CourseId: string;
  declare amount: number;
  declare currency: CreationOptional<string>;
  declare status: CreationOptional<string>;
  declare provider: CreationOptional<string>;
  declare reference: string;
  declare paystackAccessCode: string | null;
  declare paidAt: string | null;
}

Payment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
  provider: { type: DataTypes.STRING(20), defaultValue: 'paystack' },
  reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  paystackAccessCode: { type: DataTypes.STRING(200), allowNull: true },
  paidAt: { type: DataTypes.DATE, allowNull: true },
}, { sequelize, tableName: 'payments', indexes: [{ fields: ['reference'] }, { fields: ['UserId'] }, { fields: ['CourseId'] }] });

User.hasMany(Payment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Payment.belongsTo(User);
Course.hasMany(Payment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Payment.belongsTo(Course);

export { Payment };
