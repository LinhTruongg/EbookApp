'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      Bookmark.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Bookmark.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    hasNote() {
      return !!(this.note && this.note.trim());
    }

    hasHighlight() {
      return !!(this.highlightText && this.highlightText.trim());
    }

    getBookmarkType() {
      if (this.hasHighlight() && this.hasNote()) return 'highlight_with_note';
      if (this.hasHighlight()) return 'highlight';
      if (this.hasNote()) return 'note';
      return 'bookmark';
    }

    getCreatedDate() {
      return this.createdAt.toLocaleDateString('vi-VN');
    }
  }

  Bookmark.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    pageNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: 1, msg: 'Số trang tối thiểu là 1' }
      }
    },
    note: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Ghi chú tối đa 1000 ký tự'
        }
      }
    },
    highlightText: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Đoạn highlight tối đa 2000 ký tự'
        }
      }
    },
    highlightColor: {
      type: DataTypes.STRING(7),
      defaultValue: '#FFFF00',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Màu highlight không hợp lệ (format: #RRGGBB)'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Bookmark',
    tableName: 'bookmarks',
    indexes: [
      { fields: ['user_id', 'book_id'] },
      { fields: ['page_number'] },
      { fields: ['created_at'] }
    ]
  });

  return Bookmark;
};