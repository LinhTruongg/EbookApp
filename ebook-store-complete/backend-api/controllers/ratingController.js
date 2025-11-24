const { Rating, User, Book, UserLibrary } = require('../models');
const { validationResult } = require('express-validator');

// Helper function to update book's average rating
async function updateBookRating(bookId) {
  try {
    const ratings = await Rating.findAll({
      where: { bookId },
      attributes: ['rating']
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    await Book.update(
      { 
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: totalRatings
      },
      { where: { id: bookId } }
    );
  } catch (error) {
    console.error('Update book rating error:', error);
  }
}

class RatingController {
  // Create or update rating
  async createOrUpdateRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { bookId, rating } = req.body;
      const userId = req.user.id;

      // Validate rating value
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải là số nguyên từ 1 đến 5'
        });
      }

      // Check if book exists
      const book = await Book.findByPk(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Check reading progress - user must have read at least 50% to rate
      const libraryEntry = await UserLibrary.findOne({
        where: { userId, bookId }
      });

      if (!libraryEntry || libraryEntry.readingProgress < 50) {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần đọc ít nhất 50% sách để có thể đánh giá'
        });
      }

      // Check if rating already exists
      const existingRating = await Rating.findOne({
        where: { userId, bookId }
      });

      let ratingRecord;
      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        await existingRating.save();
        ratingRecord = existingRating;
      } else {
        // Create new rating
        ratingRecord = await Rating.create({
          userId,
          bookId,
          rating
        });
      }

      // Get rating with user info
      const ratingWithUser = await Rating.findByPk(ratingRecord.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }]
      });

      // Update book's average rating
      await updateBookRating(bookId);

      res.status(201).json({
        success: true,
        message: existingRating ? 'Đánh giá đã được cập nhật' : 'Đánh giá đã được tạo thành công',
        data: ratingWithUser
      });

    } catch (error) {
      console.error('Create/Update rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo/cập nhật đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's rating for a book
  async getUserRating(req, res) {
    try {
      const { bookId } = req.params;
      const userId = req.user.id;

      const rating = await Rating.findOne({
        where: { userId, bookId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }]
      });

      res.json({
        success: true,
        data: rating
      });

    } catch (error) {
      console.error('Get user rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get book rating statistics
  async getBookRatingStats(req, res) {
    try {
      const { bookId } = req.params;

      // Get rating statistics
      const ratingStats = await Rating.findAll({
        where: { bookId },
        attributes: [
          'rating',
          [require('sequelize').fn('COUNT', require('sequelize').col('rating')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'DESC']]
      });

      // Calculate average rating
      const allRatings = await Rating.findAll({
        where: { bookId },
        attributes: ['rating']
      });

      const totalRatings = allRatings.length;
      const averageRating = totalRatings > 0 
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;

      // Create rating distribution
      const ratingDistribution = [];
      for (let i = 5; i >= 1; i--) {
        const stat = ratingStats.find(s => s.rating === i);
        ratingDistribution.push({
          rating: i,
          count: stat ? parseInt(stat.dataValues.count) : 0
        });
      }

      res.json({
        success: true,
        data: {
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalRatings,
          ratingDistribution
        }
      });

    } catch (error) {
      console.error('Get book rating stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete rating
  async deleteRating(req, res) {
    try {
      const { bookId } = req.params;
      const userId = req.user.id;

      const rating = await Rating.findOne({
        where: { userId, bookId }
      });

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      await rating.destroy();

      // Update book's average rating
      await updateBookRating(bookId);

      res.json({
        success: true,
        message: 'Đánh giá đã được xóa'
      });

    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đánh giá',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new RatingController();
