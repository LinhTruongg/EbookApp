'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookAuthor extends Model {
    static associate(models) {
      // Junction table - không cần associations trực tiếp
      // Relationships được định nghĩa trong Book và Author models
    }
  }

  BookAuthor.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'authors',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('author', 'co_author', 'translator', 'editor'),
      defaultValue: 'author',
      validate: {
        isIn: {
          args: [['author', 'co_author', 'translator', 'editor']],
          msg: 'Vai trò không hợp lệ'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'BookAuthor',
    tableName: 'book_authors',
    timestamps: false,
    indexes: [
      {
        fields: ['book_id', 'author_id'],
        unique: true,
        name: 'unique_book_author'
      }
    ]
  });

  return BookAuthor;
};