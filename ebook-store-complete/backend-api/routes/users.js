const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireOwnershipOrAdmin, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authenticateToken, userController.updateProfile);

/**
 * @swagger
 * /api/users/library:
 *   get:
 *     tags: [Users]
 *     summary: Get user's library (purchased books)
 *     security:
 *       - bearerAuth: []
 */
router.get('/library', authenticateToken, userController.getUserLibrary);

/**
 * @swagger
 * /api/users/library/categorized:
 *   get:
 *     tags: [Users]
 *     summary: Get user's library books categorized by reading status (reading, favorited, completed)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved categorized library
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: object
 *                       properties:
 *                         reading:
 *                           type: array
 *                           description: Books currently being read (1-99% progress)
 *                         favorited:
 *                           type: array
 *                           description: Books marked as favorites
 *                         completed:
 *                           type: array
 *                           description: Books with 100% reading progress
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalBooks:
 *                           type: integer
 *                         reading:
 *                           type: integer
 *                         favorited:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         unread:
 *                           type: integer
 */
router.get('/library/categorized', authenticateToken, userController.getUserLibraryCategorized);

/**
 * @swagger
 * /api/users/wishlist:
 *   get:
 *     tags: [Users]
 *     summary: Get user's wishlist
 *     security:
 *       - bearerAuth: []
 */
router.get('/wishlist', authenticateToken, userController.getUserWishlist);

/**
 * @swagger
 * /api/users/reading-progress:
 *   put:
 *     tags: [Users]
 *     summary: Update reading progress for a book
 *     security:
 *       - bearerAuth: []
 */
router.put('/reading-progress', authenticateToken, userController.updateReadingProgress);

// ===== ADMIN ROUTES =====

/**
 * @swagger
 * /api/users/admin/all:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get all users for admin
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/all', authenticateToken, requireAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get user by ID for admin
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/:id', authenticateToken, requireAdmin, userController.getUserByIdAdmin);

/**
 * @swagger
 * /api/users/admin:
 *   post:
 *     tags: [Admin Users]
 *     summary: Create new user
 *     security:
 *       - bearerAuth: []
 */
router.post('/admin', authenticateToken, requireAdmin, userController.createUser);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   put:
 *     tags: [Admin Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 */
router.put('/admin/:id', authenticateToken, requireAdmin, userController.updateUser);

/**
 * @swagger
 * /api/users/admin/{id}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, userController.deleteUser);

/**
 * @swagger
 * /api/users/admin/{id}/reset-password:
 *   post:
 *     tags: [Admin Users]
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
 */
router.post('/admin/:id/reset-password', authenticateToken, requireAdmin, userController.resetUserPassword);

module.exports = router;