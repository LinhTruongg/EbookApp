'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminActivity extends Model {
    static associate(models) {
      AdminActivity.belongsTo(models.User, {
        foreignKey: 'adminId',
        as: 'admin'
      });
    }
  }

  AdminActivity.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    adminId: {
      type: DataTypes.INTEGER,
      field: 'admin_id',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false
    },
    entityType: {
      type: DataTypes.ENUM('book', 'user', 'category', 'author', 'review', 'comment'),
      field: 'entity_type',
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      field: 'entity_id',
      allowNull: true
    },
    entityName: {
      type: DataTypes.STRING(255),
      field: 'entity_name',
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address',
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent',
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'AdminActivity',
    tableName: 'admin_activity_logs',
    underscored: true,
    timestamps: false,
    indexes: [
      { fields: ['admin_id'], name: 'idx_admin_id' },
      { fields: ['entity_type', 'entity_id'], name: 'idx_entity' },
      { fields: ['action'], name: 'idx_action' },
      { fields: ['created_at'], name: 'idx_created_at' }
    ]
  });

  return AdminActivity;
};

