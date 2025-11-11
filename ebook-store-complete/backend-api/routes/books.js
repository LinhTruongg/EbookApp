const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const CloudinaryUtils = require('../utils/cloudinaryUtils');
const handleValidationErrors = require('../middleware/validate');
const {
  getBookByIdValidation,
  getBooksValidation,
  searchBooksValidation
} = require('../validators/bookValidators');

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Get books with filtering and pagination
 */
router.get('/', getBooksValidation, handleValidationErrors, optionalAuth, bookController.getBooks);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     tags: [Books]
 *     summary: Search books
 */
router.get('/search', searchBooksValidation, handleValidationErrors, optionalAuth, bookController.searchBooks);

/**
 * @swagger
 * /api/books/featured:
 *   get:
 *     tags: [Books]
 *     summary: Get featured books
 */
router.get('/featured', optionalAuth, bookController.getFeaturedBooks);

/**
 * @swagger
 * /api/books/bestsellers:
 *   get:
 *     tags: [Books]
 *     summary: Get bestseller books
 */
router.get('/bestsellers', optionalAuth, bookController.getBestsellerBooks);

/**
 * @swagger
 * /api/books/new-releases:
 *   get:
 *     tags: [Books]
 *     summary: Get new release books
 */
router.get('/new-releases', optionalAuth, bookController.getNewReleaseBooks);

// ===== ADMIN ROUTES =====

/**
 * @swagger
 * /api/books/admin/all:
 *   get:
 *     tags: [Admin Books]
 *     summary: Get all books for admin (including inactive)
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/all', authenticateToken, requireAdmin, bookController.getAllBooks);

/**
 * @swagger
 * /api/books/admin/{id}:
 *   get:
 *     tags: [Admin Books]
 *     summary: Get book by ID for admin
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/:id', authenticateToken, requireAdmin, bookController.getBookByIdAdmin);

/**
 * @swagger
 * /api/books/admin:
 *   post:
 *     tags: [Admin Books]
 *     summary: Create new book with optional Base64 file data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               fileBase64:
 *                 type: string
 *                 description: Base64 encoded file data
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: string
 */
router.post('/admin', authenticateToken, requireAdmin, bookController.createBook);

/**
 * @swagger
 * /api/books/admin/{id}:
 *   put:
 *     tags: [Admin Books]
 *     summary: Update book with optional Base64 file data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileBase64:
 *                 type: string
 *                 description: Base64 encoded file data
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: string
 */
router.put('/admin/:id', authenticateToken, requireAdmin, bookController.updateBook);

/**
 * @swagger
 * /api/books/admin/{id}:
 *   delete:
 *     tags: [Admin Books]
 *     summary: Delete book
 *     security:
 *       - bearerAuth: []
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, bookController.deleteBook);

/**
 * @swagger
 * /api/books/{id}/file:
 *   get:
 *     tags: [Books]
 *     summary: Get book file data (Base64) - separate endpoint for large file data
 *     description: Fetches only the Base64 encoded file for a book. Use this when you need just the file without other book metadata.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book file data
 *       404:
 *         description: Book or file not found
 */
router.get('/:id/file', optionalAuth, bookController.getBookFile);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get book by ID
 */
router.get('/:id', getBookByIdValidation, optionalAuth, bookController.getBookById);

/**
 * @swagger
 * /api/books/{id}/suggested:
 *   get:
 *     tags: [Books]
 *     summary: Get suggested books based on category
 */
router.get('/:id/suggested', optionalAuth, bookController.getSuggestedBooks);

/**
 * @swagger
 * /api/books/{id}/wishlist:
 *   post:
 *     tags: [Books]
 *     summary: Toggle book in wishlist
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/wishlist', authenticateToken, bookController.toggleWishlist);

/**
 * @swagger
 * /api/books/download/{publicId}:
 *   get:
 *     tags: [Books]
 *     summary: Generate signed download URL for a Cloudinary asset
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the asset
 *       - in: query
 *         name: resource_type
 *         schema:
 *           type: string
 *           enum: [raw, image, video]
 *           default: raw
 *         description: Type of resource
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           default: pdf
 *         description: Format of the asset
 *       - in: query
 *         name: expiration
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: URL expiration time in seconds
 */
router.get('/download/:publicId', authenticateToken, (req, res) => {
  try {
    const { publicId } = req.params;
    const { resource_type = 'raw', format = 'pdf', expiration = 3600 } = req.query;

    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public ID is required' 
      });
    }

    const signedUrl = CloudinaryUtils.generateSignedDownloadUrl(publicId, {
      resource_type,
      format,
      expiration: parseInt(expiration)
    });

    if (!signedUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to generate signed URL' 
      });
    }

    res.json({ 
      success: true, 
      signedUrl,
      expiresIn: parseInt(expiration)
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});



module.exports = router;