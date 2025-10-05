const { User, UserLibrary, Book, Category, Author, Wishlist, Bookmark } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
        include: [
          {
            model: UserLibrary,
            as: 'library',
            attributes: ['bookId', 'purchaseDate', 'readingProgress', 'isFavorite'],
            limit: 5,
            order: [['lastReadAt', 'DESC']]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Get reading statistics
      const stats = await this.getUserStats(userId);

      res.json({
        success: true,
        data: {
          user,
          stats
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        address,
        readingPreferences,
        favoriteCategories
      } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Update fields if provided
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (gender !== undefined) user.gender = gender;
      if (address !== undefined) user.address = address;
      if (readingPreferences !== undefined) user.readingPreferences = readingPreferences;
      if (favoriteCategories !== undefined) user.favoriteCategories = favoriteCategories;

      await user.save();

      res.json({
        success: true,
        message: 'Cập nhật profile thành công',
        data: user.toJSON()
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's book library
  async getUserLibrary(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 12,
        filter = 'all',
        sortBy = 'purchaseDate',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = { userId };

      // Apply filters
      if (filter === 'favorites') {
        whereClause.isFavorite = true;
      } else if (filter === 'reading') {
        whereClause.readingProgress = { [Op.between]: [1, 99] };
      } else if (filter === 'completed') {
        whereClause.readingProgress = 100;
      } else if (filter === 'unread') {
        whereClause.readingProgress = 0;
      }

      const library = await UserLibrary.findAndCountAll({
        where: whereClause,
        include: [{
          model: Book,
          as: 'book',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            },
            {
              model: Author,
              as: 'authors',
              attributes: ['id', 'name']
            }
          ]
        }],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          library: library.rows,
          pagination: {
            total: library.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(library.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user library error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thư viện sách',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's wishlist
  async getUserWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      const wishlist = await Wishlist.findAndCountAll({
        where: { userId },
        include: [{
          model: Book,
          as: 'book',
          where: { status: 'active' },
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            },
            {
              model: Author,
              as: 'authors',
              attributes: ['id', 'name']
            }
          ]
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        message: 'Lấy danh sách yêu thích thành công',
        data: {
          wishlist: wishlist.rows,
          pagination: {
            total: wishlist.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(wishlist.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách yêu thích',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update reading progress
  async updateReadingProgress(req, res) {
    try {
      const { bookId } = req.params;
      const { progress, pageNumber } = req.body;
      const userId = req.user.id;

      // Validate progress
      if (progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Tiến độ đọc phải từ 0-100%'
        });
      }

      const libraryEntry = await UserLibrary.findOne({
        where: { userId, bookId }
      });

      if (!libraryEntry) {
        return res.status(404).json({
          success: false,
          message: 'Sách không có trong thư viện của bạn'
        });
      }

      await libraryEntry.updateReadingProgress(progress, pageNumber);

      res.json({
        success: true,
        message: 'Cập nhật tiến độ đọc thành công',
        data: {
          progress: libraryEntry.readingProgress,
          currentPage: libraryEntry.currentPage
        }
      });

    } catch (error) {
      console.error('Update reading progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật tiến độ đọc',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to get user statistics
  async getUserStats(userId) {
    try {
      const library = await UserLibrary.findAll({
        where: { userId },
        include: ['book']
      });

      const totalBooks = library.length;
      const completedBooks = library.filter(entry => entry.readingProgress === 100).length;
      const readingBooks = library.filter(entry => entry.readingProgress > 0 && entry.readingProgress < 100).length;
      const favoriteBooks = library.filter(entry => entry.isFavorite).length;
      const totalReadingTime = library.reduce((sum, entry) => sum + (entry.readingTimeMinutes || 0), 0);
      const totalSpent = library.reduce((sum, entry) => sum + parseFloat(entry.pricePaid || 0), 0);

      return {
        totalBooks,
        completedBooks,
        readingBooks,
        favoriteBooks,
        totalReadingTime, // in minutes
        totalReadingHours: Math.round(totalReadingTime / 60),
        totalSpent,
        completionRate: totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0
      };

    } catch (error) {
      console.error('Get user stats error:', error);
      return {};
    }
  }

  // ===== ADMIN CRUD METHODS =====

  // Get all users for admin
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        role,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (role) {
        whereClause.role = role;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / limit)
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách người dùng',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user by ID for admin
  async getUserByIdAdmin(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
        include: [
          {
            model: UserLibrary,
            as: 'library',
            attributes: ['bookId', 'purchaseDate', 'readingProgress', 'isFavorite'],
            limit: 10,
            order: [['lastReadAt', 'DESC']]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Get user statistics
      const stats = await this.getUserStats(id);

      res.json({
        success: true,
        data: {
          user,
          stats
        }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin người dùng',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new user (admin only)
  async createUser(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        address,
        role = 'user',
        isActive = true,
        isVerified = false
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Họ tên, email và mật khẩu là bắt buộc'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        address,
        role,
        isActive,
        isVerified,
        verificationToken: null
      });

      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        data: user.toJSON()
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo người dùng',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user (admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        role,
        isActive,
        isVerified,
        readingPreferences,
        favoriteCategories
      } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email đã được sử dụng'
          });
        }
      }

      // Update fields
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (gender !== undefined) updateData.gender = gender;
      if (address !== undefined) updateData.address = address;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (readingPreferences !== undefined) updateData.readingPreferences = readingPreferences;
      if (favoriteCategories !== undefined) updateData.favoriteCategories = favoriteCategories;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Cập nhật người dùng thành công',
        data: user.toJSON()
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật người dùng',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Check if user has any purchases or reviews
      const hasLibrary = await UserLibrary.findOne({ where: { userId: id } });
      const hasWishlist = await Wishlist.findOne({ where: { userId: id } });
      const hasBookmarks = await Bookmark.findOne({ where: { userId: id } });

      if (hasLibrary || hasWishlist || hasBookmarks) {
        // Soft delete - just deactivate
        await user.update({ isActive: false });
        res.json({
          success: true,
          message: 'Người dùng đã được vô hiệu hóa (có dữ liệu liên quan)'
        });
      } else {
        // Hard delete
        await user.destroy();
        res.json({
          success: true,
          message: 'Xóa người dùng thành công'
        });
      }

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa người dùng',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reset user password (admin only)
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới là bắt buộc'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Đặt lại mật khẩu thành công'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đặt lại mật khẩu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserController();
