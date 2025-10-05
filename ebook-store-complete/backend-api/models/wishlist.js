'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Wishlist.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }

    // Instance methods
    getAddedDate() {
      return this.createdAt.toLocaleDateString('vi-VN');
    }

    async isBookPurchased() {
      const userLibrary = await sequelize.models.UserLibrary.findOne({
        where: {
          userId: this.userId,
          bookId: this.bookId
        }
      });
      return !!userLibrary;
    }
  }

  Wishlist.init({
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
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'wishlists',
    indexes: [
      {
        fields: ['user_id', 'book_id'],
        unique: true,
        name: 'unique_user_book_wishlist'
      }
    ]
  });

  return Wishlist;
};