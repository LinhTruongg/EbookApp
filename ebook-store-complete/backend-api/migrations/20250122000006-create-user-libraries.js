'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_libraries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      purchase_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      price_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      access_type: {
        type: Sequelize.ENUM('free', 'subscription'),
        defaultValue: 'free'
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      max_downloads: {
        type: Sequelize.INTEGER,
        defaultValue: -1
      },
      reading_progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      current_page: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      last_read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      reading_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addConstraint('user_libraries', {
      fields: ['user_id', 'book_id'],
      type: 'unique',
      name: 'unique_user_book'
    });

    await queryInterface.addIndex('user_libraries', ['user_id'], {
      name: 'idx_user_library'
    });
    await queryInterface.addIndex('user_libraries', ['book_id'], {
      name: 'idx_book_library'
    });
    await queryInterface.addIndex('user_libraries', ['is_favorite'], {
      name: 'idx_favorite'
    });
    await queryInterface.addIndex('user_libraries', ['reading_progress'], {
      name: 'idx_progress'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_libraries');
  }
};
