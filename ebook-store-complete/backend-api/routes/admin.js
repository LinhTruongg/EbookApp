const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);

// User growth statistics
router.get('/dashboard/user-growth', authenticateToken, requireAdmin, adminController.getUserGrowthStats);

// Revenue statistics
router.get('/dashboard/revenue', authenticateToken, requireAdmin, adminController.getRevenueStats);

// Recent activities
router.get('/dashboard/activities', authenticateToken, requireAdmin, adminController.getRecentActivities);

// Alternative route for activities (without dashboard prefix)
router.get('/activities', authenticateToken, requireAdmin, adminController.getActivities);

// Placeholder routes - will be implemented later (must be last)
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Admin endpoint - Not implemented yet' });
});

module.exports = router;
