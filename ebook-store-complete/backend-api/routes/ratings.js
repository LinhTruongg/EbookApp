const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const createRatingValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Rating routes working' });
});

// Routes
router.post('/', authenticateToken, ratingController.createOrUpdateRating);
router.get('/book/:bookId', authenticateToken, ratingController.getUserRating);
router.get('/book/:bookId/stats', ratingController.getBookRatingStats);
router.delete('/book/:bookId', authenticateToken, ratingController.deleteRating);

module.exports = router;
