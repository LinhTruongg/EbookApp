'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      subtitle: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      isbn: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cover_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      publisher: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      publication_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      page_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      language: {
        type: Sequelize.STRING(10),
        defaultValue: 'vi'
      },
      asset_id: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      preview_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      sample_pages: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      file: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Stores Base64 encoded book file data'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_purchases: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_revenue: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_bestseller: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_new_release: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex('books', ['category_id'], {
      name: 'idx_category'
    });
    await queryInterface.addIndex('books', ['rating'], {
      name: 'idx_rating'
    });
    await queryInterface.addIndex('books', ['is_featured'], {
      name: 'idx_featured'
    });
    await queryInterface.addIndex('books', ['title'], {
      name: 'idx_title'
    });
    await queryInterface.addIndex('books', ['title', 'description'], {
      name: 'idx_search',
      type: 'FULLTEXT'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('books');
  }
};
