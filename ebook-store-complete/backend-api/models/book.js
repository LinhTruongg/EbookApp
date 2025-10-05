'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // Book thuộc về một category
      Book.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      
      // Book có nhiều authors (many-to-many)
      Book.belongsToMany(models.Author, {
        through: models.BookAuthor,
        foreignKey: 'bookId',
        otherKey: 'authorId',
        as: 'authors'
      });
      
      // Book có nhiều user libraries
      Book.hasMany(models.UserLibrary, {
        foreignKey: 'bookId',
        as: 'userLibraries'
      });
      
      // Book có nhiều reviews
      Book.hasMany(models.Review, {
        foreignKey: 'bookId',
        as: 'reviews'
      });
      
      // Book có nhiều comments
      Book.hasMany(models.Comment, {
        foreignKey: 'bookId',
        as: 'comments'
      });
      
      // Book có nhiều bookmarks
      Book.hasMany(models.Bookmark, {
        foreignKey: 'bookId',
        as: 'bookmarks'
      });
      
      // Book có nhiều order items
      Book.hasMany(models.OrderItem, {
        foreignKey: 'bookId',
        as: 'orderItems'
      });
      
      // Book có nhiều wishlists
      Book.hasMany(models.Wishlist, {
        foreignKey: 'bookId',
        as: 'wishlists'
      });
      
      // Book có nhiều reading sessions
      Book.hasMany(models.ReadingSession, {
        foreignKey: 'bookId',
        as: 'readingSessions'
      });
    }

    // Instance methods
    getDiscountPercentage() {
      if (this.discountPrice && this.price > this.discountPrice) {
        return Math.round((1 - this.discountPrice / this.price) * 100);
      }
      return 0;
    }

    getFinalPrice() {
      return this.discountPrice || this.price;
    }

    async updateRating() {
      const reviews = await this.getReviews({
        where: { isApproved: true }
      });
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        this.rating = (totalRating / reviews.length).toFixed(2);
        this.totalReviews = reviews.length;
        await this.save();
      }
      return this.rating;
    }

    async updateStats() {
      // Update total purchases and revenue
      const orderItems = await this.getOrderItems({
        include: [{
          model: sequelize.models.Order,
          where: { status: 'paid' }
        }]
      });

      this.totalPurchases = orderItems.length;
      this.totalRevenue = orderItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      
      await this.save();
    }

    isAvailable() {
      return this.status === 'active' && this.fileUrl;
    }

    hasDiscount() {
      return this.discountPrice && this.discountPrice < this.price;
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tiêu đề sách không được để trống' },
        len: {
          args: [1, 500],
          msg: 'Tiêu đề phải từ 1-500 ký tự'
        }
      }
    },
    subtitle: {
      type: DataTypes.STRING(500),
      validate: {
        len: {
          args: [0, 500],
          msg: 'Phụ đề tối đa 500 ký tự'
        }
      }
    },
    isbn: {
      type: DataTypes.STRING(20),
      unique: { msg: 'ISBN đã tồn tại' },
      validate: {
        len: {
          args: [10, 20],
          msg: 'ISBN phải từ 10-20 ký tự'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [10, 5000],
          msg: 'Mô tả phải từ 10-5000 ký tự'
        }
      }
    },
    coverImage: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL ảnh bìa không hợp lệ' }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: 0, msg: 'Giá phải lớn hơn 0' },
        isDecimal: { msg: 'Giá phải là số thập phân' }
      }
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: { args: 0, msg: 'Giá giảm phải lớn hơn 0' },
        isDecimal: { msg: 'Giá giảm phải là số thập phân' },
        isLessThanPrice(value) {
          if (value && this.price && parseFloat(value) >= parseFloat(this.price)) {
            throw new Error('Giá giảm phải nhỏ hơn giá gốc');
          }
        }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      validate: {
        notNull: { msg: 'Phải chọn danh mục sách' }
      }
    },
    publisher: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Tên nhà xuất bản từ 1-255 ký tự'
        }
      }
    },
    publicationDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: { msg: 'Ngày xuất bản không hợp lệ' }
      }
    },
    pageCount: {
      type: DataTypes.INTEGER,
      validate: {
        min: { args: 1, msg: 'Số trang phải lớn hơn 0' },
        max: { args: 10000, msg: 'Số trang tối đa 10000' }
      }
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'vi',
      validate: {
        isIn: {
          args: [['vi', 'en', 'fr', 'de', 'ja', 'ko', 'zh']],
          msg: 'Ngôn ngữ không được hỗ trợ'
        }
      }
    },
    assetId: {
      type: DataTypes.STRING(500),
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL file không hợp lệ' }
      }
    },
    fileSize: {
      type: DataTypes.BIGINT,
      validate: {
        min: { args: 0, msg: 'Kích thước file không hợp lệ' }
      }
    },
    previewUrl: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL preview không hợp lệ' }
      }
    },
    samplePages: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: { args: 1, msg: 'Số trang mẫu tối thiểu là 1' },
        max: { args: 50, msg: 'Số trang mẫu tối đa là 50' }
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: 0, msg: 'Đánh giá tối thiểu là 0' },
        max: { args: 5, msg: 'Đánh giá tối đa là 5' }
      }
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số đánh giá không thể âm' }
      }
    },
    totalPurchases: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số lượt mua không thể âm' }
      }
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: 0, msg: 'Doanh thu không thể âm' }
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive', 'out_of_stock'),
      defaultValue: 'draft'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBestseller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isNewRelease: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    indexes: [
      { fields: ['category_id'] },
      { fields: ['price'] },
      { fields: ['rating'] },
      { fields: ['status'] },
      { fields: ['is_featured'] },
      { fields: ['is_bestseller'] },
      { fields: ['is_new_release'] },
      { fields: ['title'] },
      // Full-text search index for title and description
      {
        name: 'book_search_index',
        fields: ['title', 'description'],
        type: 'FULLTEXT'
      }
    ]
  });

  return Book;
};