const { AdminActivity } = require('../models');

class ActivityLogger {
  static async logActivity(adminId, entityType, action, entityId, entityName, description, changes = null, req = null) {
    try {
      const ipAddress = req ? (req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || null) : null;
      const userAgent = req ? req.headers?.['user-agent'] || null : null;

      await AdminActivity.create({
        adminId,
        action,
        entityType,
        entityId,
        entityName,
        description,
        changes,
        ipAddress,
        userAgent
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  static getEntityLabel(entityType) {
    const labels = {
      book: 'Sách',
      category: 'Danh mục',
      author: 'Tác giả',
      user: 'Người dùng',
      comment: 'Bình luận',
      review: 'Đánh giá'
    };
    return labels[entityType] || entityType;
  }

  static getActionLabel(action) {
    const labels = {
      create: 'Tạo mới',
      update: 'Cập nhật',
      delete: 'Xóa'
    };
    return labels[action] || action;
  }

  static async logBookActivity(adminId, action, bookId, bookTitle, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} sách "${bookTitle}"`;
    await this.logActivity(adminId, 'book', action, bookId, bookTitle, description, changes || { bookTitle }, req);
  }

  static async logCategoryActivity(adminId, action, categoryId, categoryName, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} danh mục "${categoryName}"`;
    await this.logActivity(adminId, 'category', action, categoryId, categoryName, description, changes || { categoryName }, req);
  }

  static async logAuthorActivity(adminId, action, authorId, authorName, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} tác giả "${authorName}"`;
    await this.logActivity(adminId, 'author', action, authorId, authorName, description, changes || { authorName }, req);
  }

  static async logUserActivity(adminId, action, userId, userName, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} người dùng "${userName}"`;
    await this.logActivity(adminId, 'user', action, userId, userName, description, changes || { userName }, req);
  }

  static async logCommentActivity(adminId, action, commentId, commentText, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} bình luận`;
    const truncatedText = commentText?.substring(0, 100) || null;
    await this.logActivity(adminId, 'comment', action, commentId, truncatedText, description, changes || { commentText: truncatedText }, req);
  }

  static async logReviewActivity(adminId, action, reviewId, reviewTitle, changes = null, req = null) {
    const description = `${this.getActionLabel(action)} đánh giá "${reviewTitle}"`;
    await this.logActivity(adminId, 'review', action, reviewId, reviewTitle, description, changes || { reviewTitle }, req);
  }
}

module.exports = ActivityLogger;

