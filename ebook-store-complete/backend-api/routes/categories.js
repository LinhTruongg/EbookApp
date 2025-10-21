const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all active categories
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/categories/all:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories for admin (including inactive)
 */
router.get('/all', authenticateToken, categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}/books:
 *   get:
 *     tags: [Categories]
 *     summary: Get books by category
 */
router.get('/:id/books', categoryController.getBooksByCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create new category
 */
router.post('/', authenticateToken, categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 */
router.put('/:id', authenticateToken, categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 */
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;