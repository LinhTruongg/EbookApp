'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    // Instance methods
    async markAsRead() {
      this.isRead = true;
      await this.save();
    }

    getTimeAgo() {
      const now = new Date();
      const notificationDate = new Date(this.createdAt);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);
      
      if (diffInSeconds < 60) return 'vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }

    getIcon() {
      const icons = {
        info: 'information-circle',
        success: 'checkmark-circle',
        warning: 'warning',
        error: 'alert-circle',
        promotion: 'gift'
      };
      return icons[this.type] || 'information-circle';
    }
  }

  Notification.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tiêu đề thông báo không được để trống' },
        len: {
          args: [1, 255],
          msg: 'Tiêu đề từ 1-255 ký tự'
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nội dung thông báo không được để trống' },
        len: {
          args: [1, 1000],
          msg: 'Nội dung từ 1-1000 ký tự'
        }
      }
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'promotion'),
      defaultValue: 'info'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: { msg: 'URL hành động không hợp lệ' }
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_read'] },
      { fields: ['type'] },
      { fields: ['created_at'] }
    ]
  });

  return Notification;
};