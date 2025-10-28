'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('authors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      social_links: {
        type: Sequelize.JSON,
        allowNull: true
      },
      books_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      avg_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('authors', ['name'], {
      name: 'idx_name'
    });
    await queryInterface.addIndex('authors', ['nationality'], {
      name: 'idx_nationality'
    });
    await queryInterface.addIndex('authors', ['is_active'], {
      name: 'idx_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('authors');
  }
};
