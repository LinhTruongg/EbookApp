const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public list with optional search/pagination
router.get('/', authorController.list);
router.get('/:id', authorController.getById);

// Admin CRUD
router.get('/admin/all', authenticateToken, requireAdmin, authorController.list);
router.get('/admin/:id', authenticateToken, requireAdmin, authorController.getById);
router.post('/admin', authenticateToken, requireAdmin, authorController.create);
router.put('/admin/:id', authenticateToken, requireAdmin, authorController.update);
router.delete('/admin/:id', authenticateToken, requireAdmin, authorController.remove);

module.exports = router;
