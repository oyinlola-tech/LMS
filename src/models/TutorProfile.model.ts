import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class TutorProfile extends Model<InferAttributes<TutorProfile>, InferCreationAttributes<TutorProfile>> {
  declare id: CreationOptional<string>;
  declare headline: string | null;
  declare portfolioUrl: string | null;
  declare UserId: string;
}

TutorProfile.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  headline: { type: DataTypes.STRING(200), allowNull: true },
  portfolioUrl: { type: DataTypes.STRING(500), allowNull: true },

  UserId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'TutorProfile' });

User.hasOne(TutorProfile, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
TutorProfile.belongsTo(User);

export { TutorProfile };
