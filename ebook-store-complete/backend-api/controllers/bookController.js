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
        minPrice,
        maxPrice,
        rating,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search,
        status = 'active'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { status };

      // Apply filters
      if (category) {
        whereClause.categoryId = category;
      }

      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
      }

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
            attributes: ['readingProgress', 'currentPage', 'isFavorite', 'purchaseDate']
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
          purchaseDate: userLibrary?.purchaseDate
        };
      }

      // Generate downloadable URL from assetId
      const downloadableUrl =  CloudinaryUtils.generateSignedDownloadUrl(book.assetId)

      // Add downloadable URL to book data
      const bookWithDownloadUrl = {
        ...book.toJSON(),
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

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
        });
      }

      const offset = (page - 1) * limit;

      const books = await Book.findAndCountAll({
        where: {
          status: 'active',
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } },
            { subtitle: { [Op.like]: `%${q}%` } },
            { tags: { [Op.like]: `%${q}%` } }
          ]
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
          status: 'active',
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
        where: { 
          status: 'active',
          isBestseller: true 
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
        order: [['totalPurchases', 'DESC'], ['totalRevenue', 'DESC']],
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
          status: 'active',
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
      const { bookId } = req.params;
      const userId = req.user.id;

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

  // Get all books for admin (including inactive)
  async getAllBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        category,
        status,
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

      if (status) {
        whereClause.status = status;
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

      res.json({
        success: true,
        data: book
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
      const {
        title,
        subtitle,
        description,
        isbn,
        price,
        discountPrice,
        categoryId,
        publisher,
        publicationDate,
        pageCount,
        language,
        authorIds,
        status = 'active',
        isFeatured = false,
        isBestseller = false,
        isNewRelease = false,
        tags,
        metadata
      } = req.body;

      // Validate required fields
      if (!title || !description || !price || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề, mô tả, giá và danh mục là bắt buộc'
        });
      }

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục không tồn tại'
        });
      }

      // Create book
      const book = await Book.create({
        title,
        subtitle,
        description,
        isbn,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId: parseInt(categoryId),
        publisher,
        publicationDate,
        pageCount: pageCount ? parseInt(pageCount) : null,
        language,
        status,
        isFeatured,
        isBestseller,
        isNewRelease,
        tags: tags ? JSON.stringify(tags) : null,
        metadata: metadata ? JSON.stringify(metadata) : null
      });

      // Add authors if provided
      if (authorIds && authorIds.length > 0) {
        await book.setAuthors(authorIds);
      }

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
        price,
        discountPrice,
        categoryId,
        publisher,
        publicationDate,
        pageCount,
        language,
        authorIds,
        status,
        isFeatured,
        isBestseller,
        isNewRelease,
        tags,
        metadata
      } = req.body;

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

      // Update book fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (description !== undefined) updateData.description = description;
      if (isbn !== undefined) updateData.isbn = isbn;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
      if (publisher !== undefined) updateData.publisher = publisher;
      if (publicationDate !== undefined) updateData.publicationDate = publicationDate;
      if (pageCount !== undefined) updateData.pageCount = pageCount ? parseInt(pageCount) : null;
      if (language !== undefined) updateData.language = language;
      if (status !== undefined) updateData.status = status;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
      if (isBestseller !== undefined) updateData.isBestseller = isBestseller;
      if (isNewRelease !== undefined) updateData.isNewRelease = isNewRelease;
      if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
      if (metadata !== undefined) updateData.metadata = metadata ? JSON.stringify(metadata) : null;

      await book.update(updateData);

      // Update authors if provided
      if (authorIds !== undefined) {
        await book.setAuthors(authorIds || []);
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

      // Check if book has any purchases or reviews
      const hasPurchases = await UserLibrary.findOne({ where: { bookId: id } });
      const hasReviews = await Review.findOne({ where: { bookId: id } });

      if (hasPurchases || hasReviews) {
        // Soft delete - just deactivate
        await book.update({ status: 'inactive' });
        res.json({
          success: true,
          message: 'Sách đã được vô hiệu hóa (có dữ liệu liên quan)'
        });
      } else {
        // Hard delete
        await book.destroy();
        res.json({
          success: true,
          message: 'Xóa sách thành công'
        });
      }

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
