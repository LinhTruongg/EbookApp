'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      // Coupon không có association trực tiếp
      // Được sử dụng thông qua logic trong Order
    }

    // Instance methods
    isValid() {
      const now = new Date();
      return this.isActive && 
             now >= this.validFrom && 
             now <= this.validUntil &&
             (!this.usageLimit || this.usedCount < this.usageLimit);
    }

    canUseForOrder(orderAmount) {
      return this.isValid() && orderAmount >= this.minimumOrderAmount;
    }

    calculateDiscount(orderAmount) {
      if (!this.canUseForOrder(orderAmount)) return 0;

      let discount = 0;
      if (this.discountType === 'percentage') {
        discount = (orderAmount * this.discountValue) / 100;
      } else {
        discount = this.discountValue;
      }

      // Apply maximum discount limit
      if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
        discount = this.maximumDiscountAmount;
      }

      return Math.min(discount, orderAmount);
    }

    async incrementUsage() {
      this.usedCount += 1;
      await this.save();
    }

    getRemainingUses() {
      if (!this.usageLimit) return -1; // unlimited
      return Math.max(0, this.usageLimit - this.usedCount);
    }

    getExpiryDays() {
      const now = new Date();
      const expiry = new Date(this.validUntil);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
  }

  Coupon.init({
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { msg: 'Mã coupon đã tồn tại' },
      validate: {
        notEmpty: { msg: 'Mã coupon không được để trống' },
        is: {
          args: /^[A-Z0-9]+$/,
          msg: 'Mã coupon chỉ chứa chữ hoa và số'
        },
        len: {
          args: [3, 50],
          msg: 'Mã coupon từ 3-50 ký tự'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên coupon không được để trống' },
        len: {
          args: [1, 255],
          msg: 'Tên coupon từ 1-255 ký tự'
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
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['percentage', 'fixed_amount']],
          msg: 'Loại giảm giá không hợp lệ'
        }
      }
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: 0, msg: 'Giá trị giảm giá không thể âm' },
        isDecimal: { msg: 'Giá trị giảm giá phải là số thập phân' },
        validatePercentage(value) {
          if (this.discountType === 'percentage' && (value < 0 || value > 100)) {
            throw new Error('Phần trăm giảm giá phải từ 0-100');
          }
        }
      }
    },
    minimumOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: 0, msg: 'Số tiền tối thiểu không thể âm' }
      }
    },
    maximumDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: { args: 0, msg: 'Số tiền giảm tối đa không thể âm' }
      }
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      validate: {
        min: { args: 1, msg: 'Giới hạn sử dụng tối thiểu là 1' }
      }
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: 'Số lần sử dụng không thể âm' }
      }
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Ngày bắt đầu không hợp lệ' },
        notEmpty: { msg: 'Ngày bắt đầu không được để trống' }
      }
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Ngày kết thúc không hợp lệ' },
        notEmpty: { msg: 'Ngày kết thúc không được để trống' },
        isAfterValidFrom(value) {
          if (value <= this.validFrom) {
            throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
          }
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    applicableCategories: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Danh mục áp dụng phải là mảng');
          }
        }
      }
    },
    applicableBooks: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Sách áp dụng phải là mảng');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Coupon',
    tableName: 'coupons',
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['valid_from', 'valid_until'] },
      { fields: ['is_active'] },
      { fields: ['discount_type'] }
    ]
  });

  return Coupon;
};