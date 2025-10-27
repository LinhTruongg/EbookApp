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
      
      // Removed OrderItem association as this is now a free reading app
      
      // Book có nhiều wishlists
      Book.hasMany(models.Wishlist, {
        foreignKey: 'bookId',
        as: 'wishlists'
      });
      
      // Book có nhiều ratings
      Book.hasMany(models.Rating, {
        foreignKey: 'bookId',
        as: 'ratings'
      });
      
      // Book có nhiều reading sessions
      Book.hasMany(models.ReadingSession, {
        foreignKey: 'bookId',
        as: 'readingSessions'
      });
    }

    // Instance methods
    // Removed pricing methods as this is now a free reading app

    async updateRating() {
      const ratings = await this.getRatings();
      
      if (ratings.length > 0) {
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        this.rating = parseFloat((totalRating / ratings.length).toFixed(1));
        this.reviewCount = ratings.length;
        await this.save();
      } else {
        this.rating = 0;
        this.reviewCount = 0;
        await this.save();
      }
      return this.rating;
    }

    async updateStats() {
      // Update reading stats (no purchase logic needed for free reading app)
      // This method can be used for other stats like views, downloads, etc.
      await this.save();
    }

    isAvailable() {
      return this.fileUrl;
    }

    // Removed hasDiscount method as we don't need pricing for free reading app
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
          args: [1, 5000],
          msg: 'Mô tả phải từ 1-5000 ký tự'
        }
      }
    },
    coverImage: {
      type: DataTypes.STRING(500),
      field: 'cover_image',
      validate: {
        isUrl: { msg: 'URL ảnh bìa không hợp lệ' }
      }
    },
    // Removed price and discountPrice fields as this is now a free reading app
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
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
      field: 'publication_date',
      validate: {
        isDate: { msg: 'Ngày xuất bản không hợp lệ' }
      }
    },
    pageCount: {
      type: DataTypes.INTEGER,
      field: 'page_count',
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
      field: 'asset_id',
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      field: 'file_url',
      validate: {
        isUrl: { msg: 'URL file không hợp lệ' }
      }
    },
    fileSize: {
      type: DataTypes.BIGINT,
      field: 'file_size',
      validate: {
        min: { args: 0, msg: 'Kích thước file không hợp lệ' }
      }
    },
    previewUrl: {
      type: DataTypes.STRING(500),
      field: 'preview_url',
      validate: {
        isUrl: { msg: 'URL preview không hợp lệ' }
      }
    },
    samplePages: {
      type: DataTypes.INTEGER,
      field: 'sample_pages',
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
        min: { args: [0], msg: 'Đánh giá tối thiểu là 0' },
        max: { args: [5], msg: 'Đánh giá tối đa là 5' }
      }
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      field: 'total_reviews',
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Số đánh giá không thể âm' }
      }
    },
    // Removed totalPurchases, totalRevenue and status fields as this is now a free reading app
    isFeatured: {
      type: DataTypes.BOOLEAN,
      field: 'is_featured',
      defaultValue: false
    },
    isNewRelease: {
      type: DataTypes.BOOLEAN,
      field: 'is_new_release',
      defaultValue: false
    },
    isBestseller: {
      type: DataTypes.BOOLEAN,
      field: 'is_bestseller',
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
    underscored: true,
    indexes: [
      { fields: ['category_id'] },
      { fields: ['rating'] },
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