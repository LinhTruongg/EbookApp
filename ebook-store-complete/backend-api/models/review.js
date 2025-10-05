'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Review.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    async markHelpful() {
      this.helpfulCount += 1;
      await this.save();
      return this.helpfulCount;
    }

    async checkVerifiedPurchase() {
      const userLibrary = await sequelize.models.UserLibrary.findOne({
        where: {
          userId: this.userId,
          bookId: this.bookId
        }
      });
      
      this.isVerifiedPurchase = !!userLibrary;
      await this.save();
      return this.isVerifiedPurchase;
    }

    getReviewDate() {
      return this.createdAt.toLocaleDateString('vi-VN');
    }

    isPositive() {
      return this.rating >= 4;
    }

    isNeutral() {
      return this.rating === 3;
    }

    isNegative() {
      return this.rating <= 2;
    }
  }

  Review.init({
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
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Tiêu đề đánh giá tối đa 255 ký tự'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [10, 5000],
          msg: 'Nội dung đánh giá từ 10-5000 ký tự'
        }
      }
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số lượt hữu ích không thể âm' }
      }
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    indexes: [
      {
        fields: ['user_id', 'book_id'],
        unique: true,
        name: 'unique_user_book_review'
      },
      { fields: ['book_id'] },
      { fields: ['rating'] },
      { fields: ['is_approved'] },
      { fields: ['created_at'] }
    ],
    hooks: {
      afterCreate: async (review) => {
        // Update book rating after new review
        const book = await review.getBook();
        if (book) {
          await book.updateRating();
        }
      },
      afterUpdate: async (review) => {
        // Update book rating after review update
        if (review.changed('rating') || review.changed('isApproved')) {
          const book = await review.getBook();
          if (book) {
            await book.updateRating();
          }
        }
      },
      afterDestroy: async (review) => {
        // Update book rating after review deletion
        const book = await sequelize.models.Book.findByPk(review.bookId);
        if (book) {
          await book.updateRating();
        }
      }
    }
  });

  return Review;
};