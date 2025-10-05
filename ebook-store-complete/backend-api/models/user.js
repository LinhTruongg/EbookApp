'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User có nhiều books trong library
      User.hasMany(models.UserLibrary, {
        foreignKey: 'userId',
        as: 'library'
      });
      
      // User có nhiều orders
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      });
      
      // User có nhiều reviews
      User.hasMany(models.Review, {
        foreignKey: 'userId',
        as: 'reviews'
      });
      
      // User có nhiều comments
      User.hasMany(models.Comment, {
        foreignKey: 'userId',
        as: 'comments'
      });

      // User có nhiều comment likes
      User.hasMany(models.CommentLike, {
        foreignKey: 'userId',
        as: 'commentLikes'
      });
      
      // User có nhiều bookmarks
      User.hasMany(models.Bookmark, {
        foreignKey: 'userId',
        as: 'bookmarks'
      });
      
      // User có nhiều wishlists
      User.hasMany(models.Wishlist, {
        foreignKey: 'userId',
        as: 'wishlists'
      });
      
      // User có nhiều reading sessions
      User.hasMany(models.ReadingSession, {
        foreignKey: 'userId',
        as: 'readingSessions'
      });
      
      // User có nhiều notifications
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
      });
    }

    // Instance methods
    async comparePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.verificationToken;
      delete values.resetPasswordToken;
      return values;
    }

    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    async getPurchasedBooks() {
      const library = await this.getUserLibrary({
        include: ['book']
      });
      return library.map(entry => entry.book);
    }
  }

  User.init({
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên không được để trống' },
        len: {
          args: [2, 50],
          msg: 'Tên phải từ 2-50 ký tự'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Họ không được để trống' },
        len: {
          args: [2, 50],
          msg: 'Họ phải từ 2-50 ký tự'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email đã được sử dụng'
      },
      validate: {
        isEmail: { msg: 'Email không hợp lệ' },
        notEmpty: { msg: 'Email không được để trống' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: 'Mật khẩu phải từ 6-100 ký tự'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      validate: {
        is: {
          args: /^[0-9+\-\s()]+$/,
          msg: 'Số điện thoại không hợp lệ'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL avatar không hợp lệ' }
      }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      validate: {
        isDate: { msg: 'Ngày sinh không hợp lệ' },
        isBefore: {
          args: new Date().toISOString(),
          msg: 'Ngày sinh không thể là tương lai'
        }
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      validate: {
        isIn: {
          args: [['male', 'female', 'other']],
          msg: 'Giới tính không hợp lệ'
        }
      }
    },
    address: DataTypes.TEXT,
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['user', 'admin']],
          msg: 'Role không hợp lệ'
        }
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    lastLogin: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    readingPreferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'light',
        fontSize: 16,
        fontFamily: 'default',
        lineHeight: 1.5
      }
    },
    favoriteCategories: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    totalSpent: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    booksPurchased: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    },
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['role'] },
      { fields: ['is_active'] },
      { fields: ['verification_token'] },
      { fields: ['reset_password_token'] }
    ]
  });

  return User;
};