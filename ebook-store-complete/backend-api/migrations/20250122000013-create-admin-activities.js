'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin_activity_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('create', 'update', 'delete'),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.ENUM('book', 'user', 'category', 'author', 'review', 'comment'),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      entity_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('admin_activity_logs', ['admin_id'], {
      name: 'idx_admin_id'
    });
    await queryInterface.addIndex('admin_activity_logs', ['entity_type', 'entity_id'], {
      name: 'idx_entity'
    });
    await queryInterface.addIndex('admin_activity_logs', ['action'], {
      name: 'idx_action'
    });
    await queryInterface.addIndex('admin_activity_logs', ['created_at'], {
      name: 'idx_created_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('admin_activity_logs');
  }
};

