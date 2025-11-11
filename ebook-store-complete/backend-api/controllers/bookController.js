const { Book, Category, Author, UserLibrary, Wishlist, Review } = require('../models');
const { Op } = require('sequelize');
const CloudinaryUtils = require('../utils/cloudinaryUtils');

class BookController {
  // Get all books with filtering, sorting, and pagination
  async getBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        rating,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (category) {
        whereClause.categoryId = category;
      }

      // Removed price filtering as this is now a free reading app

      if (rating) {
        whereClause.rating = { [Op.gte]: parseFloat(rating) };
      }

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { subtitle: { [Op.like]: `%${search}%` } }
        ];
      }

      const books = await Book.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['file'] },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: []
            }
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });


      res.json({
        success: true,
        data: {
          books: books.rows,
          pagination: {
            total: books.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(books.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get book by ID with user-specific information
  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const book = await Book.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug', 'description']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'bio', 'avatar', 'nationality'],
            through: {
              attributes: []
            }
          },
          {
            model: Review,
            as: 'reviews',
            where: { isApproved: true },
            required: false,
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
              model: require('../models').User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'avatar']
            }]
          }
        ]
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Get user-specific information if authenticated
      let userInfo = {};
      if (userId) {
        const [userLibrary, wishlist] = await Promise.all([
          UserLibrary.findOne({
            where: { userId, bookId: id },
            attributes: ['readingProgress', 'currentPage', 'isFavorite']
          }),
          Wishlist.findOne({
            where: { userId, bookId: id }
          })
        ]);

        userInfo = {
          isOwned: !!userLibrary,
          isInWishlist: !!wishlist,
          readingProgress: userLibrary?.readingProgress || 0,
          currentPage: userLibrary?.currentPage || 1,
          isFavorite: userLibrary?.isFavorite || false,
        };
      }

      // Generate downloadable URL from assetId
      const downloadableUrl =  CloudinaryUtils.generateSignedDownloadUrl(book.assetId)

      // Add downloadable URL to book data and exclude 'file' field (it's large and fetched separately)
      const bookData = book.toJSON();
      delete bookData.file; // Remove file field to reduce payload size

      const bookWithDownloadUrl = {
        ...bookData,
        downloadableUrl
      };

      res.json({
        success: true,
        data: {
          book: bookWithDownloadUrl,
          userInfo
        }
      });

    } catch (error) {
      console.error('Get book by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search books
  async searchBooks(req, res) {
    try {
      const { q, page = 1, limit = 12 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
        });
      }

      const offset = (page - 1) * limit;
      const searchTerm = `%${q.trim()}%`;

      const books = await Book.findAndCountAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: searchTerm } },
            { description: { [Op.like]: searchTerm } },
            { subtitle: { [Op.like]: searchTerm } }
          ]
        },
        attributes: { exclude: ['file'] },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
            required: false
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            },
            required: false
          }
        ],
        order: [['rating', 'DESC'], ['totalReviews', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        success: true,
        data: {
          books: books.rows,
          searchQuery: q,
          pagination: {
            total: books.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(books.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Search books error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tìm kiếm sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get featured books
  async getFeaturedBooks(req, res) {
    try {
      const { limit = 6 } = req.query;

      const books = await Book.findAll({
        where: { 
          isFeatured: true 
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
        order: [['rating', 'DESC'], ['totalReviews', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: books
      });

    } catch (error) {
      console.error('Get featured books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy sách nổi bật',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get bestseller books
  async getBestsellerBooks(req, res) {
    try {
      const { limit = 6 } = req.query;

      const books = await Book.findAll({
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
        order: [['rating', 'DESC'], ['totalReviews', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: books
      });

    } catch (error) {
      console.error('Get bestseller books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy sách bán chạy',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get new release books
  async getNewReleaseBooks(req, res) {
    try {
      const { limit = 6 } = req.query;

      const books = await Book.findAll({
        where: { 
          isNewRelease: true 
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
        order: [['publicationDate', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: books
      });

    } catch (error) {
      console.error('Get new release books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy sách mới',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add/remove book from wishlist
  async toggleWishlist(req, res) {
    try {
      const { id } = req.params;
      const bookId = id;
      const userId = req.user.id;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mã sách'
        });
      }

      const existingWishlist = await Wishlist.findOne({
        where: { userId, bookId }
      });

      if (existingWishlist) {
        await existingWishlist.destroy();
        res.json({
          success: true,
          message: 'Đã xóa khỏi danh sách yêu thích',
          inWishlist: false
        });
      } else {
        await Wishlist.create({ userId, bookId });
        res.json({
          success: true,
          message: 'Đã thêm vào danh sách yêu thích',
          inWishlist: true
        });
      }

    } catch (error) {
      console.error('Toggle wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật danh sách yêu thích',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===== ADMIN CRUD METHODS =====

  // Get all books for admin
  async getAllBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (category) {
        whereClause.categoryId = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { subtitle: { [Op.like]: `%${search}%` } },
          { isbn: { [Op.like]: `%${search}%` } }
        ];
      }

      const books = await Book.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['file'] },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: []
            }
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({
        success: true,
        data: books.rows,
        pagination: {
          total: books.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(books.count / limit)
        }
      });

    } catch (error) {
      console.error('Get all books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get book by ID for admin
  async getBookByIdAdmin(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: []
            }
          }
        ]
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Exclude 'file' field to reduce payload size (file is fetched separately via /books/:id/file)
      const bookData = book.toJSON ? book.toJSON() : book;
      delete bookData.file;

      res.json({
        success: true,
        data: bookData
      });

    } catch (error) {
      console.error('Get book by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new book
  async createBook(req, res) {
    try {
      console.log('📝 [createBook] Request received');

      const {
        title,
        subtitle,
        description,
        isbn,
        categoryId,
        publisher,
        publicationDate,
        pageCount,
        language,
        authorIds,
        isFeatured = false,
        isBestseller = false,
        isNewRelease = false,
        isLockedByPoints = false,
        pointsRequired = 0,
        tags,
        metadata,
        coverImage,
        coverImageBase64,
        coverImageName,
        coverImageType,
        coverImageSize,
        fileUrl,
        fileSize,
        previewUrl,
        samplePages,
        fileBase64
      } = req.body;

      const toBool = (v) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return v.trim().toLowerCase() === 'true' || v === '1';
        return !!v;
      };
      const toInt = (v, def = 0) => {
        const n = parseInt(v);
        return Number.isFinite(n) ? n : def;
      };

      // Normalize authorIds (can arrive as JSON string when using FormData)
      let normalizedAuthorIds = authorIds;
      if (typeof normalizedAuthorIds === 'string') {
        try {
          const parsed = JSON.parse(normalizedAuthorIds);
          if (Array.isArray(parsed)) {
            normalizedAuthorIds = parsed.map((id) => parseInt(id)).filter((n) => Number.isFinite(n));
          }
        } catch {
          // Fallback: comma-separated values
          normalizedAuthorIds = normalizedAuthorIds
            .split(',')
            .map((s) => parseInt(s.trim()))
            .filter((n) => Number.isFinite(n));
        }
      }

      // Validate required fields
      if (!title || !description || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề, mô tả và danh mục là bắt buộc'
        });
      }

      // Validate Base64 file is provided (required for creating book)
      // Temporarily disabled for testing
      // if (!fileBase64) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Tệp sách là bắt buộc khi tạo sách mới'
      //   });
      // }

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục không tồn tại'
        });
      }

      // Handle Base64 file data
      let bookFile = null;
      if (fileBase64) {
        // Store Base64 data directly in the file column
        bookFile = fileBase64;
      }

      // Handle cover image Base64 data
      let coverImageData = coverImage; // Use existing coverImage if provided
      if (coverImageBase64) {
        console.log('🖼️ [createBook] Processing cover image Base64 data');
        try {
          // Upload cover image to Cloudinary
          const uploadResult = await CloudinaryUtils.uploadBase64Image(
            coverImageBase64,
            `books/covers/${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
            {
              folder: 'books/covers',
              resource_type: 'image',
              format: 'jpg',
              quality: 'auto',
              transformation: [
                { width: 400, height: 600, crop: 'fill', gravity: 'center' }
              ]
            }
          );
          
          if (uploadResult && uploadResult.secure_url) {
            coverImageData = uploadResult.secure_url;
            console.log('✅ [createBook] Cover image uploaded successfully:', coverImageData);
          } else {
            console.warn('⚠️ [createBook] Cover image upload failed, using Base64 data directly');
            coverImageData = `data:${coverImageType || 'image/jpeg'};base64,${coverImageBase64}`;
          }
        } catch (error) {
          console.error('❌ [createBook] Error uploading cover image:', error);
          // Fallback to Base64 data
          coverImageData = `data:${coverImageType || 'image/jpeg'};base64,${coverImageBase64}`;
        }
      }

      // Coerce lock fields
      const lockedFlag = toBool(isLockedByPoints);
      const requiredPts = toInt(pointsRequired, 0);

      // Auto-enforce consistency: if pointsRequired > 0, force lock
      const finalLocked = lockedFlag || requiredPts > 0;

      // Create book
      const book = await Book.create({
        title,
        subtitle,
        description,
        isbn,
        categoryId: parseInt(categoryId),
        publisher,
        publicationDate,
        pageCount: pageCount ? parseInt(pageCount) : null,
        language,
        isFeatured,
        isBestseller,
        isNewRelease,
        isLockedByPoints: finalLocked,
        pointsRequired: requiredPts,
        tags: tags ?? null,
        metadata: metadata ?? null,
        coverImage: coverImageData,
        fileUrl,
        fileSize: fileSize ? parseInt(fileSize) : null,
        previewUrl,
        samplePages: samplePages ? parseInt(samplePages) : null,
        file: bookFile,
        // Set default values for statistics
        rating: 0.00,
        totalReviews: 0
      });

      // Add authors if provided
      if (normalizedAuthorIds && normalizedAuthorIds.length > 0) {
        await book.setAuthors(normalizedAuthorIds);
      }

      // Update category book count
      await category.updateBookCount();

      // Fetch the created book with relations
      const createdBook = await Book.findByPk(book.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: []
            }
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Tạo sách thành công',
        data: createdBook
      });

    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update book
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        subtitle,
        description,
        isbn,
        categoryId,
        publisher,
        publicationDate,
        pageCount,
        language,
        authorIds,
        isFeatured,
        isBestseller,
        isNewRelease,
        isLockedByPoints,
        pointsRequired,
        tags,
        metadata,
        coverImage,
        coverImageBase64,
        coverImageName,
        coverImageType,
        coverImageSize,
        fileUrl,
        fileSize,
        previewUrl,
        samplePages,
        fileBase64
      } = req.body;

      const toBoolU = (v) => {
        if (v === undefined) return undefined;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return v.trim().toLowerCase() === 'true' || v === '1';
        return !!v;
      };
      const toIntU = (v) => {
        if (v === undefined) return undefined;
        const n = parseInt(v);
        return Number.isFinite(n) ? n : 0;
      };

      // Normalize authorIds
      let normalizedAuthorIds = authorIds;
      if (typeof normalizedAuthorIds === 'string') {
        try {
          const parsed = JSON.parse(normalizedAuthorIds);
          if (Array.isArray(parsed)) {
            normalizedAuthorIds = parsed.map((id) => parseInt(id)).filter((n) => Number.isFinite(n));
          }
        } catch {
          normalizedAuthorIds = normalizedAuthorIds
            .split(',')
            .map((s) => parseInt(s.trim()))
            .filter((n) => Number.isFinite(n));
        }
      }

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Check if category exists (if provided)
      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục không tồn tại'
          });
        }
      }

      // Handle Base64 file data if provided (optional when updating)
      let bookFile = undefined;
      if (fileBase64) {
        bookFile = fileBase64;
        console.log('✅ [updateBook] Base64 file processed:', {
          size: fileBase64.length,
          fileName,
          fileType,
          preview: fileBase64.substring(0, 50) + '...'
        });
      }

      // Handle cover image Base64 data if provided
      let coverImageData = coverImage; // Use existing coverImage if provided
      if (coverImageBase64) {
        console.log('🖼️ [updateBook] Processing cover image Base64 data');
        try {
          // Upload cover image to Cloudinary
          const uploadResult = await CloudinaryUtils.uploadBase64Image(
            coverImageBase64,
            `books/covers/${title?.replace(/[^a-zA-Z0-9]/g, '_') || book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
            {
              folder: 'books/covers',
              resource_type: 'image',
              format: 'jpg',
              quality: 'auto',
              transformation: [
                { width: 400, height: 600, crop: 'fill', gravity: 'center' }
              ]
            }
          );
          
          if (uploadResult && uploadResult.secure_url) {
            coverImageData = uploadResult.secure_url;
            console.log('✅ [updateBook] Cover image uploaded successfully:', coverImageData);
          } else {
            console.warn('⚠️ [updateBook] Cover image upload failed, using Base64 data directly');
            coverImageData = `data:${coverImageType || 'image/jpeg'};base64,${coverImageBase64}`;
          }
        } catch (error) {
          console.error('❌ [updateBook] Error uploading cover image:', error);
          // Fallback to Base64 data
          coverImageData = `data:${coverImageType || 'image/jpeg'};base64,${coverImageBase64}`;
        }
      }

      // Update book fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (description !== undefined) updateData.description = description;
      if (isbn !== undefined) updateData.isbn = isbn;
      // Removed price and discount logic as this is now a free reading app
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
      if (publisher !== undefined) updateData.publisher = publisher;
      if (publicationDate !== undefined) updateData.publicationDate = publicationDate;
      if (pageCount !== undefined) updateData.pageCount = pageCount ? parseInt(pageCount) : null;
      if (language !== undefined) updateData.language = language;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
      if (isBestseller !== undefined) updateData.isBestseller = isBestseller;
      if (isNewRelease !== undefined) updateData.isNewRelease = isNewRelease;
      const lockedU = toBoolU(isLockedByPoints);
      const pointsU = toIntU(pointsRequired);
      if (pointsU !== undefined) updateData.pointsRequired = pointsU;
      if (lockedU !== undefined) {
        updateData.isLockedByPoints = lockedU;
      }
      // Auto-enforce: if pointsRequired > 0 then lock
      if (updateData.pointsRequired !== undefined && updateData.pointsRequired > 0) {
        updateData.isLockedByPoints = true;
      }
      if (tags !== undefined) updateData.tags = tags ?? null;
      if (metadata !== undefined) updateData.metadata = metadata ?? null;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (coverImageBase64 !== undefined) updateData.coverImage = coverImageData;
      if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
      if (fileSize !== undefined) updateData.fileSize = fileSize ? parseInt(fileSize) : null;
      if (previewUrl !== undefined) updateData.previewUrl = previewUrl;
      if (samplePages !== undefined) updateData.samplePages = samplePages ? parseInt(samplePages) : null;
      if (bookFile !== undefined) updateData.file = bookFile;

      // Removed price and discount logic as this is now a free reading app

      await book.update(updateData);

      // Update authors if provided
      if (authorIds !== undefined) {
        await book.setAuthors(normalizedAuthorIds || []);
      }

      // Update category book counts if category changed
      if (categoryId !== undefined && categoryId !== book.categoryId) {
        // Update old category count
        const oldCategory = await Category.findByPk(book.categoryId);
        if (oldCategory) {
          await oldCategory.updateBookCount();
        }
        // Update new category count
        const newCategory = await Category.findByPk(categoryId);
        if (newCategory) {
          await newCategory.updateBookCount();
        }
      }

      // Fetch the updated book with relations
      const updatedBook = await Book.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name', 'avatar'],
            through: {
              attributes: []
            }
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cập nhật sách thành công',
        data: updatedBook
      });

    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get suggested books based on category and similar books
  async getSuggestedBooks(req, res) {
    try {
      const { id } = req.params;
      const { limit = 6 } = req.query;

      const currentBook = await Book.findByPk(id, {
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }]
      });

      if (!currentBook) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Get books from same category, excluding current book
      const suggestedBooks = await Book.findAll({
        where: {
          id: { [Op.ne]: id },
          categoryId: currentBook.categoryId
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Author,
            as: 'authors',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
        order: [
          ['rating', 'DESC'],
          ['totalReviews', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: suggestedBooks
      });

    } catch (error) {
      console.error('Get suggested books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy sách gợi ý',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get book file data (Base64) - separate endpoint to avoid loading large data in list requests
  async getBookFile(req, res) {
    try {
      const { id } = req.params;

      console.log('📥 [getBookFile] Fetching file for book:', id);

      const book = await Book.findByPk(id, {
        attributes: ['id', 'title', 'file']
      });

      if (!book) {
        console.warn('⚠️ [getBookFile] Book not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Enforce access control for point-locked books: must be in user's library
      try {
        const lockedCheck = await Book.findByPk(id, { attributes: ['isLockedByPoints', 'pointsRequired'] });
        if (lockedCheck && (lockedCheck.isLockedByPoints || (lockedCheck.pointsRequired || 0) > 0)) {
          const userId = req.user?.id;
          if (!userId) {
            return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để đọc sách' });
          }
          const { UserLibrary } = require('../models');
          const lib = await UserLibrary.findOne({ where: { userId, bookId: id } });
          if (!lib) {
            return res.status(403).json({ success: false, message: 'Sách cần điểm để mở khóa. Vui lòng mở khóa trước khi đọc.' });
          }
        }
      } catch (e) {
        console.error('⚠️ [getBookFile] Access control check failed:', e.message);
      }

      if (!book.file) {
        console.warn('⚠️ [getBookFile] Book has no file:', id);
        return res.status(404).json({
          success: false,
          message: 'Sách này không có file PDF'
        });
      }

      console.log('✅ [getBookFile] File found, size:', book.file.length, 'characters');

      res.json({
        success: true,
        data: {
          bookId: book.id,
          title: book.title,
          file: book.file
        }
      });

    } catch (error) {
      console.error('❌ [getBookFile] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy file sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete book
  async deleteBook(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách'
        });
      }

      // Get category before deleting to update count
      const category = await Category.findByPk(book.categoryId);
      
      // Hard delete - always delete from database
      await book.destroy();
      
      // Update category book count
      if (category) {
        await category.updateBookCount();
      }
      
      res.json({
        success: true,
        message: 'Xóa sách thành công'
      });

    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new BookController();
