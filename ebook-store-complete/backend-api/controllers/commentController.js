const { Comment, User, Book, CommentLike } = require('../models');
const { Op } = require('sequelize');

// Get all comments for a book
const getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 20, parentId = null } = req.query;
    const userId = req.user ? req.user.id : null; // Get user ID if authenticated

    const offset = (page - 1) * limit;

    const whereClause = {
      bookId: parseInt(bookId),
      isApproved: true
    };

    // If parentId is specified, get replies to that comment
    if (parentId) {
      whereClause.parentId = parseInt(parentId);
    } else {
      // Get top-level comments only
      whereClause.parentId = null;
    }

    const comments = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'avatar']
            }
          ],
          where: { isApproved: true },
          required: false,
          limit: 5,
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get user's likes for all comments if user is authenticated
    let userLikes = [];
    if (userId) {
      // Get all comment IDs including replies
      const allCommentIds = [];
      comments.rows.forEach(comment => {
        allCommentIds.push(comment.id);
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            allCommentIds.push(reply.id);
          });
        }
      });
      
      const likesData = await CommentLike.findAll({
        where: {
          userId: userId,
          commentId: { [Op.in]: allCommentIds }
        },
        attributes: ['commentId']
      });
      
      userLikes = likesData.map(like => parseInt(like.commentId));
    }

    // Format comments for response
    const formattedComments = comments.rows.map(comment => ({
      id: comment.id,
      content: comment.content,
      likesCount: comment.likesCount,
      hasLiked: userId ? userLikes.includes(parseInt(comment.id)) : false,
      createdAt: comment.createdAt,
      timeAgo: comment.getTimeAgo(),
      user: {
        id: comment.user.id,
        name: `${comment.user.firstName} ${comment.user.lastName}`,
        avatar: comment.user.avatar
      },
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        likesCount: reply.likesCount,
        hasLiked: userId ? userLikes.includes(parseInt(reply.id)) : false,
        createdAt: reply.createdAt,
        timeAgo: reply.getTimeAgo(),
        user: {
          id: reply.user.id,
          name: `${reply.user.firstName} ${reply.user.lastName}`,
          avatar: reply.user.avatar
        }
      })),
      repliesCount: comment.replies.length
    }));

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(comments.count / limit),
          totalComments: comments.count,
          hasNextPage: offset + parseInt(limit) < comments.count
        }
      },
      message: 'Lấy danh sách bình luận thành công'
    });
  } catch (error) {
    console.error('Error getting book comments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bình luận',
      error: error.message
    });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được vượt quá 2000 ký tự'
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

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận gốc'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      userId,
      bookId: parseInt(bookId),
      content: content.trim(),
      parentId: parentId ? parseInt(parentId) : null,
      isApproved: true,
      likesCount: 0
    });

    // Fetch the created comment with user info
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      likesCount: newComment.likesCount,
      createdAt: newComment.createdAt,
      timeAgo: newComment.getTimeAgo(),
      user: {
        id: newComment.user.id,
        name: `${newComment.user.firstName} ${newComment.user.lastName}`,
        avatar: newComment.user.avatar
      },
      replies: [],
      repliesCount: 0
    };

    res.status(201).json({
      success: true,
      data: formattedComment,
      message: 'Thêm bình luận thành công'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bình luận',
      error: error.message
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được vượt quá 2000 ký tự'
      });
    }

    // Find comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bình luận này'
      });
    }

    // Update comment
    await comment.update({
      content: content.trim()
    });

    res.json({
      success: true,
      message: 'Cập nhật bình luận thành công'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bình luận',
      error: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Find comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    // Delete comment (this will also delete replies due to cascade)
    await comment.destroy();

    res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bình luận',
      error: error.message
    });
  }
};

// Toggle like/unlike a comment
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Find comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Check if user already liked this comment
    const existingLike = await CommentLike.findOne({
      where: {
        userId: userId,
        commentId: parseInt(commentId)
      }
    });

    if (existingLike) {
      // User has already liked - remove the like (unlike)
      await existingLike.destroy();
      
      // Decrement likes count
      const newLikesCount = await comment.decrementLikes();

      res.json({
        success: true,
        data: {
          likesCount: newLikesCount,
          hasLiked: false
        },
        message: 'Đã bỏ thích bình luận'
      });
    } else {
      // User hasn't liked yet - add the like
      await CommentLike.create({
        userId: userId,
        commentId: parseInt(commentId)
      });

      // Increment likes count
      const newLikesCount = await comment.incrementLikes();

      res.json({
        success: true,
        data: {
          likesCount: newLikesCount,
          hasLiked: true
        },
        message: 'Đã thích bình luận'
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thích/bỏ thích bình luận',
      error: error.message
    });
  }
};

// Get comment statistics for a book
const getCommentStats = async (req, res) => {
  try {
    const { bookId } = req.params;

    const stats = await Comment.findAll({
      where: {
        bookId: parseInt(bookId),
        isApproved: true
      },
      attributes: [
        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('id')), 'totalComments'],
        [Comment.sequelize.fn('SUM', Comment.sequelize.col('likes_count')), 'totalLikes']
      ],
      raw: true
    });

    const result = stats[0] || { totalComments: 0, totalLikes: 0 };

    res.json({
      success: true,
      data: {
        totalComments: parseInt(result.totalComments) || 0,
        totalLikes: parseInt(result.totalLikes) || 0
      },
      message: 'Lấy thống kê bình luận thành công'
    });
  } catch (error) {
    console.error('Error getting comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê bình luận',
      error: error.message
    });
  }
};

module.exports = {
  getBookComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentStats
};
