import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { User } from './User.model';
import { Course } from './Course.model';

class WishlistItem extends Model<InferAttributes<WishlistItem>, InferCreationAttributes<WishlistItem>> {
  declare id: CreationOptional<string>;
  declare UserId: string;
  declare CourseId: string;
}

WishlistItem.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  UserId: { type: DataTypes.UUID, allowNull: false },
  CourseId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, tableName: 'wishlist_items', indexes: [{ unique: true, fields: ['UserId', 'CourseId'] }] });

User.hasMany(WishlistItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
WishlistItem.belongsTo(User);
Course.hasMany(WishlistItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
WishlistItem.belongsTo(Course);

export { WishlistItem };
