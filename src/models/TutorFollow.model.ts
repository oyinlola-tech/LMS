import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';

class TutorFollow extends Model<InferAttributes<TutorFollow>, InferCreationAttributes<TutorFollow>> {
  declare id: CreationOptional<string>;
  declare tutorId: string;
  declare followerId: string;
}

TutorFollow.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  tutorId: { type: DataTypes.UUID, allowNull: false },
  followerId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'TutorFollow', indexes: [{ unique: true, fields: ['tutorId', 'followerId'] }] });

User.belongsToMany(User, {
  through: TutorFollow,
  as: 'followers',
  foreignKey: 'tutorId',
  otherKey: 'followerId',
});

User.belongsToMany(User, {
  through: TutorFollow,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'tutorId',
});

export { TutorFollow };
