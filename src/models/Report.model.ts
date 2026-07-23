import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class Report extends Model<InferAttributes<Report>, InferCreationAttributes<Report>> {
  declare id: CreationOptional<string>;
  declare reporterId: string;
  declare reportedId: string;
  declare reason: string;
  declare lastMessages: object | null;
  declare status: CreationOptional<string>;
  declare resolvedById: string | null;
  declare resolvedAt: string | null;
}

Report.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporterId: { type: DataTypes.UUID, allowNull: false },
  reportedId: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  lastMessages: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.ENUM('open', 'resolved', 'dismissed'), defaultValue: 'open' },
  resolvedById: { type: DataTypes.UUID, allowNull: true },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
}, { sequelize, tableName: 'reports', indexes: [{ fields: ['status'] }, { fields: ['reportedId'] }] });

User.hasMany(Report, { as: 'reportsMade', foreignKey: 'reporterId', onDelete: 'CASCADE' });
Report.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });
User.hasMany(Report, { as: 'reportsReceived', foreignKey: 'reportedId', onDelete: 'CASCADE' });
Report.belongsTo(User, { as: 'reported', foreignKey: 'reportedId' });

export { Report };
