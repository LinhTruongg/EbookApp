const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all comments for a book
router.get('/book/:bookId', commentController.getBookComments);

// Get comment statistics for a book
router.get('/book/:bookId/stats', commentController.getCommentStats);

// Create a new comment (requires authentication)
router.post('/book/:bookId', authenticateToken, commentController.createComment);

// Update a comment (requires authentication)
router.put('/:commentId', authenticateToken, commentController.updateComment);

// Delete a comment (requires authentication)
router.delete('/:commentId', authenticateToken, commentController.deleteComment);

// Like/Unlike a comment (requires authentication)
router.post('/:commentId/like', authenticateToken, commentController.toggleCommentLike);

// Admin routes
// Get all comments for admin management
router.get('/admin/all', authenticateToken, requireAdmin, commentController.getAllComments);

// Get comment statistics for admin
router.get('/admin/stats', authenticateToken, requireAdmin, commentController.getAdminCommentStats);

// Update comment status (approve/reject)
router.put('/admin/:commentId/status', authenticateToken, requireAdmin, commentController.updateCommentStatus);

// Delete comment (admin)
router.delete('/admin/:commentId', authenticateToken, requireAdmin, commentController.adminDeleteComment);

module.exports = router;
