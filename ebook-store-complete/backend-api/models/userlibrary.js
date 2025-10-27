'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserLibrary extends Model {
    static associate(models) {
      UserLibrary.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      UserLibrary.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    async updateReadingProgress(progress, pageNumber) {
      this.readingProgress = Math.min(Math.max(progress, 0), 100);
      if (pageNumber) this.currentPage = pageNumber;
      this.lastReadAt = new Date();
      await this.save();
    }

    async incrementReadingTime(minutes) {
      this.readingTimeMinutes = parseInt(this.readingTimeMinutes || 0) + minutes;
      await this.save();
    }

    canDownload() {
      if (this.maxDownloads === -1) return true;
      return this.downloadCount < this.maxDownloads;
    }

    async incrementDownload() {
      if (this.canDownload()) {
        this.downloadCount += 1;
        await this.save();
        return true;
      }
      return false;
    }

    getReadingStatus() {
      if (this.readingProgress === 0) return 'unread';
      if (this.readingProgress === 100) return 'completed';
      return 'reading';
    }

    getProgressPercentage() {
      return `${this.readingProgress}%`;
    }
  }

  UserLibrary.init({
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
    accessType: {
      type: DataTypes.ENUM('free', 'subscription'),
      defaultValue: 'free'
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số lần tải không thể âm' }
      }
    },
    maxDownloads: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1 means unlimited
      validate: {
        min: { args: -1, msg: 'Giới hạn tải tối thiểu là -1' }
      }
    },
    readingProgress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Tiến độ đọc tối thiểu là 0%' },
        max: { args: 100, msg: 'Tiến độ đọc tối đa là 100%' }
      }
    },
    currentPage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: { args: 1, msg: 'Trang hiện tại tối thiểu là 1' }
      }
    },
    lastReadAt: DataTypes.DATE,
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readingTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Thời gian đọc không thể âm' }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 5000],
          msg: 'Ghi chú tối đa 5000 ký tự'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'UserLibrary',
    tableName: 'user_libraries',
    indexes: [
      {
        fields: ['user_id', 'book_id'],
        unique: true,
        name: 'unique_user_book'
      },
      { fields: ['user_id'] },
      { fields: ['book_id'] },
      { fields: ['access_type'] },
      { fields: ['reading_progress'] },
      { fields: ['is_favorite'] }
    ]
  });

  return UserLibrary;
};