'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if status column exists before removing
    const tableDescription = await queryInterface.describeTable('books');
    if (tableDescription.status) {
      await queryInterface.removeColumn('books', 'status');
    }
    
    // Check if status index exists before removing
    try {
      await queryInterface.removeIndex('books', 'idx_status');
    } catch (error) {
      // Index doesn't exist, continue
      console.log('Index idx_status does not exist, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add status column back
    await queryInterface.addColumn('books', 'status', {
      type: Sequelize.ENUM('draft', 'active', 'inactive', 'out_of_stock'),
      defaultValue: 'draft'
    });
    
    // Add status index back
    await queryInterface.addIndex('books', ['status'], {
      name: 'idx_status'
    });
  }
};
