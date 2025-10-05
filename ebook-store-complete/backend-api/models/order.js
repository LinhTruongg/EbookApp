'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'items'
      });
    }

    // Instance methods
    async calculateTotal() {
      const items = await this.getItems();
      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      
      this.totalAmount = subtotal;
      this.finalAmount = subtotal - this.discountAmount;
      await this.save();
      
      return this.finalAmount;
    }

    async addToUserLibrary() {
      const items = await this.getItems({ include: ['book'] });
      
      for (let item of items) {
        await sequelize.models.UserLibrary.findOrCreate({
          where: {
            userId: this.userId,
            bookId: item.bookId
          },
          defaults: {
            purchaseDate: this.createdAt,
            pricePaid: item.totalPrice,
            orderId: this.id,
            accessType: 'purchased'
          }
        });
      }
    }

    generateOrderNumber() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `ORD${timestamp}${random}`;
    }

    isPaid() {
      return this.status === 'paid';
    }

    canRefund() {
      return this.status === 'paid' && this.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }

  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { msg: 'Mã đơn hàng đã tồn tại' }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: 0, msg: 'Tổng tiền không thể âm' },
        isDecimal: { msg: 'Tổng tiền phải là số thập phân' }
      }
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: { args: 0, msg: 'Số tiền giảm không thể âm' }
      }
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: 0, msg: 'Thành tiền không thể âm' }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'paid', 'failed', 'refunded', 'cancelled']],
          msg: 'Trạng thái đơn hàng không hợp lệ'
        }
      }
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe', 'paypal', 'momo', 'bank_transfer'),
      defaultValue: 'stripe'
    },
    paymentIntentId: DataTypes.STRING,
    paymentDetails: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    hooks: {
      beforeCreate: (order) => {
        if (!order.orderNumber) {
          order.orderNumber = order.generateOrderNumber();
        }
      },
      afterUpdate: async (order) => {
        // Add books to user library when order is paid
        if (order.changed('status') && order.status === 'paid') {
          await order.addToUserLibrary();
          
          // Update user stats
          const user = await order.getUser();
          if (user) {
            user.totalSpent = parseFloat(user.totalSpent || 0) + parseFloat(order.finalAmount);
            user.booksPurchased = parseInt(user.booksPurchased || 0) + 1;
            await user.save();
          }
        }
      }
    },
    indexes: [
      { fields: ['user_id'] },
      { fields: ['order_number'], unique: true },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ]
  });

  return Order;
};