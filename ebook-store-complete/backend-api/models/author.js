'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.belongsToMany(models.Book, {
        through: models.BookAuthor,
        foreignKey: 'authorId',
        otherKey: 'bookId',
        as: 'books'
      });
    }

    // Instance methods
    async updateStats() {
      const books = await this.getBooks({
      });
      
      this.booksCount = books.length;
      
      if (books.length > 0) {
        const totalRating = books.reduce((sum, book) => sum + parseFloat(book.rating || 0), 0);
        this.avgRating = (totalRating / books.length).toFixed(2);
      } else {
        this.avgRating = 0.00;
      }
      
      await this.save();
    }

    getAge() {
      if (!this.birthDate) return null;
      const today = new Date();
      const birthDate = new Date(this.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
  }

  Author.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên tác giả không được để trống' },
        len: {
          args: [1, 255],
          msg: 'Tên tác giả từ 1-255 ký tự'
        }
      }
    },
    bio: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 5000],
          msg: 'Tiểu sử tối đa 5000 ký tự'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL avatar không hợp lệ' }
      }
    },
    birthDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: { msg: 'Ngày sinh không hợp lệ' },
        isBefore: {
          args: new Date().toISOString(),
          msg: 'Ngày sinh không thể là tương lai'
        }
      }
    },
    nationality: {
      type: DataTypes.STRING(100),
      validate: {
        len: {
          args: [0, 100],
          msg: 'Quốc tịch tối đa 100 ký tự'
        }
      }
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: { msg: 'URL website không hợp lệ' }
      }
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {},
      validate: {
        isValidSocialLinks(value) {
          if (value && typeof value === 'object') {
            const allowedPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
            for (let platform in value) {
              if (!allowedPlatforms.includes(platform)) {
                throw new Error(`Platform ${platform} không được hỗ trợ`);
              }
              if (typeof value[platform] !== 'string') {
                throw new Error(`Link ${platform} phải là string`);
              }
            }
          }
        }
      }
    },
    booksCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Số sách không thể âm' }
      }
    },
    avgRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Đánh giá trung bình tối thiểu là 0' },
        max: { args: [5], msg: 'Đánh giá trung bình tối đa là 5' }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Author',
    tableName: 'authors',
    indexes: [
      { fields: ['name'] },
      { fields: ['nationality'] },
      { fields: ['is_active'] },
      { fields: ['avg_rating'] }
    ]
  });

  return Author;
};