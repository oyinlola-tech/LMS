import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Course } from './Course.model';
import { CourseSection } from './CourseSection.model';
import { User } from './User.model';

class Assignment extends Model<InferAttributes<Assignment>, InferCreationAttributes<Assignment>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: string | null;
  declare totalPoints: number | null;
  declare status: CreationOptional<string>;
  declare dueDate: string | null;
  declare moduleNumber: number | null;
  declare proTip: string | null;
  declare coreObjective: string | null;
  declare keyDeliverables: object | null;
  declare CourseId: string;
  declare moduleId: string;
  declare createdById: string;
}

Assignment.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  totalPoints: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'published'), allowNull: false, defaultValue: 'draft' },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  moduleNumber: { type: DataTypes.INTEGER, allowNull: true },
  proTip: { type: DataTypes.TEXT, allowNull: true },
  coreObjective: { type: DataTypes.TEXT, allowNull: true },
  keyDeliverables: { type: DataTypes.JSON, allowNull: true },

  CourseId: { type: DataTypes.UUID, allowNull: false },
  moduleId: { type: DataTypes.UUID, allowNull: false },
  createdById: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: 'Assignment' });

Course.hasMany(Assignment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Assignment.belongsTo(Course);

CourseSection.hasMany(Assignment, { foreignKey: { name: 'moduleId', allowNull: false }, onDelete: 'CASCADE' });
Assignment.belongsTo(CourseSection, { as: 'module', foreignKey: 'moduleId' });

User.hasMany(Assignment, { foreignKey: { name: 'createdById', allowNull: false }, onDelete: 'CASCADE' });
Assignment.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

export { Assignment };
