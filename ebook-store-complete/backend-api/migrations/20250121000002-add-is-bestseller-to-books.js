'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('books', 'is_bestseller', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_bestseller'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('books', 'is_bestseller');
  }
};
