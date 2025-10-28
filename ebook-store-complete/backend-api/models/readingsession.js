'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReadingSession extends Model {
    static associate(models) {
      ReadingSession.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      ReadingSession.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    calculateDuration() {
      if (this.endTime && this.startTime) {
        const diffMs = new Date(this.endTime) - new Date(this.startTime);
        this.durationMinutes = Math.round(diffMs / (1000 * 60));
      }
      return this.durationMinutes;
    }

    isActive() {
      return !this.endTime;
    }

    async endSession() {
      this.endTime = new Date();
      this.calculateDuration();
      await this.save();
      
      // Update user library reading time
      const userLibrary = await sequelize.models.UserLibrary.findOne({
        where: {
          userId: this.userId,
          bookId: this.bookId
        }
      });
      
      if (userLibrary) {
        await userLibrary.incrementReadingTime(this.durationMinutes);
      }
    }
  }

  ReadingSession.init({
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
    startTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    endTime: DataTypes.DATE,
    pagesRead: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Số trang đọc không thể âm' }
      }
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Thời gian đọc không thể âm' }
      }
    },
    deviceInfo: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'ReadingSession',
    tableName: 'reading_sessions',
    indexes: [
      { fields: ['user_id', 'book_id'] },
      { fields: ['start_time'] }
    ]
  });

  return ReadingSession;
};