const { Review, User, Book } = require('../models');
const { validationResult } = require('express-validator');

class ReviewController {
  // Create review
  async createReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { bookId, rating, title, content } = req.body;
      const userId = req.user.id;

      // Check if user owns the book
      const libraryEntry = await require('../models').UserLibrary.findOne({
        where: { userId, bookId }
      });

      // Check if review already exists
      const existingReview = await Review.findOne({
        where: { userId, bookId }
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'Bạn đã đánh giá sách này rồi'
        });
      }

      const review = await Review.create({
        userId,
        bookId,
        rating,
        title,
        content,
        isVerifiedPurchase: !!libraryEntry
      });

      const reviewWithUser = await Review.findByPk(review.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Đánh giá đã được tạo thành công',
        data: reviewWithUser
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get reviews for a book
  async getBookReviews(req, res) {
    try {
      const { bookId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        rating
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = { bookId, isApproved: true };

      if (rating) {
        whereClause.rating = parseInt(rating);
      }

      const reviews = await Review.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Get rating distribution
      const ratingStats = await Review.findAll({
        where: { bookId, isApproved: true },
        attributes: [
          'rating',
          [require('sequelize').fn('COUNT', require('sequelize').col('rating')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          reviews: reviews.rows,
          ratingStats,
          pagination: {
            total: reviews.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(reviews.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get book reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, title, content } = req.body;
      const userId = req.user.id;

      const review = await Review.findOne({
        where: { id: reviewId, userId }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá hoặc không có quyền sửa'
        });
      }

      // Update fields
      if (rating !== undefined) review.rating = rating;
      if (title !== undefined) review.title = title;
      if (content !== undefined) review.content = content;

      await review.save();

      res.json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: review
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findOne({
        where: { id: reviewId, userId }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá hoặc không có quyền xóa'
        });
      }

      await review.destroy();

      res.json({
        success: true,
        message: 'Xóa đánh giá thành công'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ReviewController();
