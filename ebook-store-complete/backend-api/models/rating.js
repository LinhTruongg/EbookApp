'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Rating.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    getRatingDate() {
      return this.createdAt.toLocaleDateString('vi-VN');
    }

    isHighRating() {
      return this.rating >= 4;
    }

    isLowRating() {
      return this.rating <= 2;
    }
  }

  Rating.init({
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: 1, msg: 'Đánh giá tối thiểu là 1 sao' },
        max: { args: 5, msg: 'Đánh giá tối đa là 5 sao' },
        isInt: { msg: 'Đánh giá phải là số nguyên' }
      }
    }
  }, {
    sequelize,
    modelName: 'Rating',
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'bookId'],
        name: 'unique_user_book_rating'
      },
      {
        fields: ['bookId'],
        name: 'idx_book_ratings'
      },
      {
        fields: ['rating'],
        name: 'idx_rating_value'
      }
    ]
  });

  return Rating;
};
