'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Category có nhiều books
      Category.hasMany(models.Book, {
        foreignKey: 'categoryId',
        as: 'books'
      });
      
      // Self-referential association for subcategories
      Category.hasMany(models.Category, {
        foreignKey: 'parentId',
        as: 'subcategories'
      });
      
      Category.belongsTo(models.Category, {
        foreignKey: 'parentId',
        as: 'parent'
      });
    }

    // Instance methods
    async updateBookCount() {
      const count = await this.countBooks({ 
      });
      this.booksCount = count;
      await this.save();
      return count;
    }

    async getFullPath() {
      let path = [this.name];
      let current = this;
      
      while (current.parentId) {
        current = await current.getParent();
        if (current) {
          path.unshift(current.name);
        } else {
          break;
        }
      }
      
      return path.join(' > ');
    }

    async getAllSubcategories() {
      const subcategories = await this.getSubcategories({
        include: ['subcategories']
      });
      
      let allSubs = [...subcategories];
      for (let sub of subcategories) {
        const nestedSubs = await sub.getAllSubcategories();
        allSubs = [...allSubs, ...nestedSubs];
      }
      
      return allSubs;
    }
  }

  Category.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên danh mục không được để trống' },
        len: {
          args: [1, 100],
          msg: 'Tên danh mục từ 1-100 ký tự'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Slug đã tồn tại' },
      validate: {
        notEmpty: { msg: 'Slug không được để trống' },
        is: {
          args: /^[a-z0-9-]+$/,
          msg: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'
        },
        len: {
          args: [1, 100],
          msg: 'Slug từ 1-100 ký tự'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Mô tả tối đa 1000 ký tự'
        }
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      field: 'parent_id',
      references: {
        model: 'categories',
        key: 'id'
      },
      validate: {
        notSelfReference(value) {
          if (value && value === this.id) {
            throw new Error('Danh mục không thể là cha của chính nó');
          }
        }
      }
    },
    image: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL hình ảnh không hợp lệ' }
      }
    },
    icon: {
      type: DataTypes.STRING(100),
      validate: {
        len: {
          args: [0, 100],
          msg: 'Tên icon tối đa 100 ký tự'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'is_active',
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      field: 'sort_order',
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Thứ tự sắp xếp không thể âm' }
      }
    },
    booksCount: {
      type: DataTypes.INTEGER,
      field: 'books_count',
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số lượng sách không thể âm' }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    underscored: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['parent_id'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] }
    ]
  });

  return Category;
};