'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Comment.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
      
      // Self-referential association for replies
      Comment.belongsTo(models.Comment, {
        foreignKey: 'parentId',
        as: 'parent'
      });
      
      Comment.hasMany(models.Comment, {
        foreignKey: 'parentId',
        as: 'replies'
      });

      // Association với CommentLike
      Comment.hasMany(models.CommentLike, {
        foreignKey: 'commentId',
        as: 'likes'
      });
    }

    // Instance methods
    async incrementLikes() {
      this.likesCount += 1;
      await this.save();
      return this.likesCount;
    }

    async decrementLikes() {
      if (this.likesCount > 0) {
        this.likesCount -= 1;
        await this.save();
      }
      return this.likesCount;
    }

    isReply() {
      return !!this.parentId;
    }

    async getRepliesCount() {
      return await this.countReplies({
        where: { isApproved: true }
      });
    }

    async getNestedReplies() {
      const replies = await this.getReplies({
        where: { isApproved: true },
        include: ['user', 'replies'],
        order: [['createdAt', 'ASC']]
      });
      
      return replies;
    }

    getCommentDate() {
      return this.createdAt.toLocaleDateString('vi-VN');
    }

    getTimeAgo() {
      const now = new Date();
      const commentDate = new Date(this.createdAt);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);
      
      if (diffInSeconds < 60) return 'vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
  }

  Comment.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'comments',
        key: 'id'
      },
      validate: {
        notSelfReference(value) {
          if (value && value === this.id) {
            throw new Error('Bình luận không thể trả lời chính nó');
          }
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nội dung bình luận không được để trống' },
        len: {
          args: [1, 2000],
          msg: 'Nội dung bình luận từ 1-2000 ký tự'
        }
      }
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likes_count'
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    indexes: [
      { fields: ['book_id'] },
      { fields: ['user_id'] },
      { fields: ['parent_id'] },
      { fields: ['is_approved'] },
      { fields: ['created_at'] }
    ]
  });

  return Comment;
};