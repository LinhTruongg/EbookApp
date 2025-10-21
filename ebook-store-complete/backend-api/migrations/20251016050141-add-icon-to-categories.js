'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('categories');
    if (!table.icon) {
      await queryInterface.addColumn('categories', 'icon', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('categories');
    if (table.icon) {
      await queryInterface.removeColumn('categories', 'icon');
    }
  }
};
