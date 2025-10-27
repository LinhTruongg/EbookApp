const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);

// User growth statistics
router.get('/dashboard/user-growth', authenticateToken, requireAdmin, adminController.getUserGrowthStats);

// Placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Admin endpoint - Not implemented yet' });
});

module.exports = router;
