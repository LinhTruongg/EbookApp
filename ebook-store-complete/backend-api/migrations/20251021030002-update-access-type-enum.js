'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update existing data to change 'purchased' to 'free'
    await queryInterface.sequelize.query(
      "UPDATE user_libraries SET access_type = 'free' WHERE access_type = 'purchased'"
    );
    
    // Update access_type enum to remove 'purchased'
    await queryInterface.changeColumn('user_libraries', 'access_type', {
      type: Sequelize.ENUM('free', 'subscription'),
      defaultValue: 'free'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restore access_type enum
    await queryInterface.changeColumn('user_libraries', 'access_type', {
      type: Sequelize.ENUM('purchased', 'free', 'subscription'),
      defaultValue: 'purchased'
    });
  }
};
