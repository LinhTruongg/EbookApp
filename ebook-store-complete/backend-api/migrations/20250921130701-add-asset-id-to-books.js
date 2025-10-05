'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('books', 'asset_id', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'language'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('books', 'asset_id');
  }
};
