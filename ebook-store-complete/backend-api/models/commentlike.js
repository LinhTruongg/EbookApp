'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentLike extends Model {
    static associate(models) {
      // Association với User
      CommentLike.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Association với Comment
      CommentLike.belongsTo(models.Comment, {
        foreignKey: 'commentId',
        as: 'comment'
      });
    }
  }

  CommentLike.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'comment_id',
      references: {
        model: 'comments',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'CommentLike',
    tableName: 'comment_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'commentId'],
        name: 'unique_user_comment_like'
      }
    ]
  });

  return CommentLike;
};
