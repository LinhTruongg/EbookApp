const { Category, Book, Author } = require('../models');
const { Op } = require('sequelize');

class CategoryController {
  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'slug', 'description', 'booksCount', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
        order: [['name', 'ASC']]
      });

      // Transform the data to match the frontend expectations
      const transformedCategories = categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon || 'book',
        booksCount: category.booksCount,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }));

      res.json({
        success: true,
        data: transformedCategories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get books by category
  async getBooksByCategory(req, res) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        minPrice,
        maxPrice
      } = req.query;

      const category = await Category.findByPk(id, {
        attributes: ['id', 'name', 'slug', 'description']
      });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }

      // For now, just use the current category ID since parent_id column doesn't exist
      const categoryIds = [id];

      const offset = (page - 1) * limit;
      const whereClause = {
        category_id: { [Op.in]: categoryIds }
      };

      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
      }

      // Use raw query to avoid Sequelize issues with non-existent columns
      const { count, rows: books } = await Book.findAndCountAll({
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
            attributes: ['id', 'name']
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
        raw: false,
        subQuery: false,
      });

      res.json({
        success: true,
        data: {
          category,
          books: books,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get books by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy sách theo danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all categories for admin (including inactive)
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'slug', 'description', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      });

      const transformed = categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: 'book',
        booksCount: category.booksCount || 0,
        isActive: category.isActive,
        sortOrder: category.sortOrder || 0,
        parentId: category.parentId || null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }));

      res.json({
        success: true,
        data: transformed
      });

    } catch (error) {
      console.error('Get all categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      
      const category = await Category.findByPk(id, {
        attributes: ['id', 'name', 'slug', 'description', 'booksCount', 'isActive', 'sortOrder', 'createdAt', 'updatedAt', 'icon']
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }

      // Transform the data to match the frontend expectations
      const transformedCategory = {
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon || 'book',
        booksCount: category.booksCount,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };

      res.json({
        success: true,
        data: transformedCategory
      });

    } catch (error) {
      console.error('Get category by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new category
  async createCategory(req, res) {
    try {
      const { name, slug, description, parentId, image, icon, sortOrder } = req.body;

      // Validate required fields
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Tên và slug là bắt buộc'
        });
      }

      // Check if slug already exists
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Slug đã tồn tại'
        });
      }

      // Validate parent category if provided
      if (parentId) {
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục cha không tồn tại'
          });
        }
      }

      const category = await Category.create({
        name,
        slug,
        description,
        parentId,
        image,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true,
        booksCount: 0
      });

      // Fetch the created category with associations
      const createdCategory = await Category.findByPk(category.id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: createdCategory
      });

    } catch (error) {
      console.error('Create category error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors.map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description, parentId, image, icon, sortOrder, isActive } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }

      // Check if slug already exists (excluding current category)
      if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ 
          where: { slug, id: { [Op.ne]: id } } 
        });
        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Slug đã tồn tại'
          });
        }
      }

      // Validate parent category if provided
      if (parentId && parentId !== category.parentId) {
        if (parentId === id) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục không thể là cha của chính nó'
          });
        }
        
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục cha không tồn tại'
          });
        }
      }

      await category.update({
        name: name || category.name,
        slug: slug || category.slug,
        description: description !== undefined ? description : category.description,
        parentId: parentId !== undefined ? parentId : category.parentId,
        image: image !== undefined ? image : category.image,
        icon: icon !== undefined ? icon : category.icon,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        isActive: isActive !== undefined ? isActive : category.isActive
      });

      // Fetch the updated category with associations
      const updatedCategory = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cập nhật danh mục thành công',
        data: updatedCategory
      });

    } catch (error) {
      console.error('Update category error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors.map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }

      // Check if category has subcategories
      const subcategories = await Category.count({ where: { parentId: id } });
      if (subcategories > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa danh mục có danh mục con'
        });
      }

      // Check if category has books
      const booksCount = await Book.count({ where: { categoryId: id } });
      if (booksCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa danh mục có sách'
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Xóa danh mục thành công'
      });

    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa danh mục',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CategoryController();
