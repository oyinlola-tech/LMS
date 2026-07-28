'use strict';

const table = 'Users';
const column = 'notificationPreferences';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, column, {
      type: Sequelize.DataTypes.JSON,
      allowNull: true,
      comment: 'User notification preferences',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, column);
  },
};