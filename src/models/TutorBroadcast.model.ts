import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class TutorBroadcast extends Model<InferAttributes<TutorBroadcast>, InferCreationAttributes<TutorBroadcast>> {
  declare id: CreationOptional<string>;
  declare subject: string;
  declare body: string;
  declare tutorId: string;
}

TutorBroadcast.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  subject: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },

  tutorId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'TutorBroadcast' });

User.hasMany(TutorBroadcast, { foreignKey: { name: 'tutorId', allowNull: false }, onDelete: 'CASCADE' });
TutorBroadcast.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

export { TutorBroadcast };
