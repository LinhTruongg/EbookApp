const { Book, User, Category, Comment, Review, UserLibrary, WalletTransaction, AdminActivity } = require('../models');
const { Op } = require('sequelize');
const ActivityLogger = require('../utils/activityLogger');

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      console.log('📊 Fetching dashboard statistics...');

      // Test basic database connection first
      let totalBooks = 0;
      let totalUsers = 0;
      let totalCategories = 0;
      let totalComments = 0;
      let totalReviews = 0;
      let totalReadingSessions = 0;
      let newBooksLast30Days = 0;
      let newUsersLast30Days = 0;

      try {
        // Get total books count
        totalBooks = await Book.count({
        });
        console.log('✅ Total books:', totalBooks);
      } catch (error) {
        console.error('❌ Error counting books:', error);
      }

      try {
        // Get total users count
        totalUsers = await User.count({
          where: { isActive: true }
        });
        console.log('✅ Total users:', totalUsers);
      } catch (error) {
        console.error('❌ Error counting users:', error);
      }

      try {
        // Get total categories count
        totalCategories = await Category.count({
          where: { isActive: true }
        });
        console.log('✅ Total categories:', totalCategories);
      } catch (error) {
        console.error('❌ Error counting categories:', error);
      }

      try {
        // Get total comments count
        totalComments = await Comment.count();
        console.log('✅ Total comments:', totalComments);
      } catch (error) {
        console.error('❌ Error counting comments:', error);
      }

      try {
        // Get total reviews count
        totalReviews = await Review.count();
        console.log('✅ Total reviews:', totalReviews);
      } catch (error) {
        console.error('❌ Error counting reviews:', error);
      }

      try {
        // Get total reading sessions
        totalReadingSessions = await UserLibrary.count();
        console.log('✅ Total reading sessions:', totalReadingSessions);
      } catch (error) {
        console.error('❌ Error counting reading sessions:', error);
      }

      try {
        // Get books added in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        newBooksLast30Days = await Book.count({
          where: {
            createdAt: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        });
        console.log('✅ New books last 30 days:', newBooksLast30Days);
      } catch (error) {
        console.error('❌ Error counting new books:', error);
      }

      try {
        // Get new users in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        newUsersLast30Days = await User.count({
          where: {
            isActive: true,
            createdAt: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        });
        console.log('✅ New users last 30 days:', newUsersLast30Days);
      } catch (error) {
        console.error('❌ Error counting new users:', error);
      }

      // Simplified response without complex queries
      const stats = {
        overview: {
          totalBooks,
          totalUsers,
          totalCategories,
          totalComments,
          totalReviews,
          totalReadingSessions
        },
        growth: {
          newBooksLast30Days,
          newUsersLast30Days
        },
        popularBooks: [],
        recentActivity: {
          recentBooks: [],
          recentUsers: []
        }
      };

      res.json({
        success: true,
        data: stats,
        message: 'Lấy thống kê dashboard thành công'
      });

    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê dashboard',
        error: error.message
      });
    }
  }

  // Get user growth statistics over time
  async getUserGrowthStats(req, res) {
    try {
      console.log('📈 Fetching user growth statistics...');

      const { period = '12months' } = req.query; // 6months, 12months, 24months
      
      let monthsBack = 12;
      if (period === '6months') monthsBack = 6;
      if (period === '24months') monthsBack = 24;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);
      startDate.setDate(1); // Start of month

      // Get user growth data by month
      const userGrowthData = await User.findAll({
        attributes: [
          [User.sequelize.fn('DATE_FORMAT', User.sequelize.col('created_at'), '%Y-%m'), 'month'],
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'userCount']
        ],
        where: {
          createdAt: {
            [Op.gte]: startDate
          },
          isActive: true
        },
        group: [User.sequelize.fn('DATE_FORMAT', User.sequelize.col('created_at'), '%Y-%m')],
        order: [[User.sequelize.fn('DATE_FORMAT', User.sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true
      });

      // Get total users by month (cumulative)
      const totalUsersByMonth = [];
      let cumulativeTotal = 0;

      // Generate all months in the range
      const months = [];
      const currentDate = new Date(startDate);
      while (currentDate <= new Date()) {
        months.push(currentDate.toISOString().substring(0, 7)); // YYYY-MM format
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Fill in the data for each month
      months.forEach(month => {
        const monthData = userGrowthData.find(data => data.month === month);
        const newUsers = monthData ? parseInt(monthData.userCount) : 0;
        cumulativeTotal += newUsers;
        
        totalUsersByMonth.push({
          month: month,
          newUsers: newUsers,
          totalUsers: cumulativeTotal
        });
      });

      // Get current month stats
      const currentMonth = new Date().toISOString().substring(0, 7);
      const currentMonthData = totalUsersByMonth.find(data => data.month === currentMonth);
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStr = previousMonth.toISOString().substring(0, 7);
      const previousMonthData = totalUsersByMonth.find(data => data.month === previousMonthStr);

      // Calculate growth percentage
      let growthPercentage = 0;
      if (previousMonthData && previousMonthData.totalUsers > 0) {
        growthPercentage = ((currentMonthData?.totalUsers || 0) - previousMonthData.totalUsers) / previousMonthData.totalUsers * 100;
      }

      const stats = {
        period: period,
        totalUsers: cumulativeTotal,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        monthlyData: totalUsersByMonth,
        currentMonth: {
          newUsers: currentMonthData?.newUsers || 0,
          totalUsers: currentMonthData?.totalUsers || 0
        },
        previousMonth: {
          newUsers: previousMonthData?.newUsers || 0,
          totalUsers: previousMonthData?.totalUsers || 0
        }
      };

      res.json({
        success: true,
        data: stats,
        message: 'Lấy thống kê tăng trưởng người dùng thành công'
      });

    } catch (error) {
      console.error('Error getting user growth stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê tăng trưởng người dùng',
        error: error.message
      });
    }
  }

  // Get revenue statistics over time
  async getRevenueStats(req, res) {
    try {
      console.log('💰 Fetching revenue statistics...');

      const { period = '12months' } = req.query; // 6months, 12months, 24months
      
      let monthsBack = 12;
      if (period === '6months') monthsBack = 6;
      if (period === '24months') monthsBack = 24;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);
      startDate.setDate(1); // Start of month

      // Get purchase transactions (revenue) grouped by month
      const { sequelize } = WalletTransaction;
      const revenueData = await WalletTransaction.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('SUM', sequelize.literal('ABS(points)')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'purchases']
        ],
        where: {
          type: 'purchase',
          createdAt: {
            [Op.gte]: startDate
          }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true
      });

      // Generate all months in the range
      const months = [];
      const currentDate = new Date(startDate);
      while (currentDate <= new Date()) {
        months.push(currentDate.toISOString().substring(0, 7)); // YYYY-MM format
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Fill in the data for each month
      const monthlyData = months.map(month => {
        const monthData = revenueData.find(data => data.month === month);
        return {
          month: month,
          revenue: monthData ? parseInt(monthData.revenue) || 0 : 0,
          purchases: monthData ? parseInt(monthData.purchases) || 0 : 0
        };
      });

      // Calculate total revenue and purchases
      const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
      const totalPurchases = monthlyData.reduce((sum, item) => sum + item.purchases, 0);

      // Get current month stats
      const currentMonth = new Date().toISOString().substring(0, 7);
      const currentMonthData = monthlyData.find(data => data.month === currentMonth);
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStr = previousMonth.toISOString().substring(0, 7);
      const previousMonthData = monthlyData.find(data => data.month === previousMonthStr);

      // Calculate growth percentage
      let growthPercentage = 0;
      if (previousMonthData && previousMonthData.revenue > 0) {
        growthPercentage = ((currentMonthData?.revenue || 0) - previousMonthData.revenue) / previousMonthData.revenue * 100;
      } else if (currentMonthData?.revenue > 0 && (!previousMonthData || previousMonthData.revenue === 0)) {
        growthPercentage = 100; // 100% growth if previous month had no revenue
      }

      const stats = {
        period: period,
        totalRevenue: totalRevenue,
        totalPurchases: totalPurchases,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        monthlyData: monthlyData,
        currentMonth: {
          revenue: currentMonthData?.revenue || 0,
          purchases: currentMonthData?.purchases || 0
        },
        previousMonth: {
          revenue: previousMonthData?.revenue || 0,
          purchases: previousMonthData?.purchases || 0
        }
      };

      res.json({
        success: true,
        data: stats,
        message: 'Lấy thống kê doanh thu thành công'
      });

    } catch (error) {
      console.error('Error getting revenue stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê doanh thu',
        error: error.message
      });
    }
  }

  // Get recent admin activities
  async getRecentActivities(req, res) {
    try {
      console.log('📋 [getRecentActivities] Request received');
      const { limit = 20 } = req.query;
      
      console.log('📋 [getRecentActivities] Fetching activities with limit:', limit);
      
      let activities = [];
      try {
        activities = await AdminActivity.findAll({
          include: [
            {
              model: User,
              as: 'admin',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
              required: false
            }
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit) || 20,
          raw: false
        });
        console.log('📋 [getRecentActivities] Found', activities.length, 'activities');
      } catch (dbError) {
        console.error('❌ [getRecentActivities] Database error:', dbError);
        console.error('❌ [getRecentActivities] Error details:', {
          message: dbError.message,
          name: dbError.name,
          stack: dbError.stack
        });
        
        return res.json({
          success: true,
          data: [],
          message: 'Không có hoạt động nào hoặc có lỗi khi tải dữ liệu'
        });
      }

      const formattedActivities = (activities || []).map(activity => {
        try {
          return {
            id: activity.id || null,
            action: activity.action || 'unknown',
            actionLabel: ActivityLogger.getActionLabel(activity.action || ''),
            entityType: activity.entityType || 'unknown',
            entityLabel: ActivityLogger.getEntityLabel(activity.entityType || ''),
            entityId: activity.entityId || null,
            entityName: activity.entityName || null,
            description: activity.description || '',
            changes: activity.changes || {},
            admin: {
              id: activity.admin?.id || null,
              name: activity.admin ? `${activity.admin.firstName || ''} ${activity.admin.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
              email: activity.admin?.email || '',
              avatar: activity.admin?.avatar || null
            },
            createdAt: activity.createdAt || new Date().toISOString()
          };
        } catch (mapError) {
          console.error('❌ [getRecentActivities] Error mapping activity:', mapError);
          return null;
        }
      }).filter(activity => activity !== null);

      console.log('📋 [getRecentActivities] Formatted', formattedActivities.length, 'activities');

      res.json({
        success: true,
        data: formattedActivities,
        message: 'Lấy hoạt động gần đây thành công'
      });

    } catch (error) {
      console.error('❌ [getRecentActivities] Unexpected error:', error);
      console.error('❌ [getRecentActivities] Error stack:', error.stack);
      res.json({
        success: true,
        data: [],
        message: 'Có lỗi xảy ra khi lấy hoạt động gần đây'
      });
    }
  }

  // Get activities with format for React component
  async getActivities(req, res) {
    try {
      console.log('📋 [getActivities] Request received');
      const { 
        page = 1, 
        limit = 20, 
        entityType = '', 
        actionType = '' 
      } = req.query;
      
      const where = {};
      if (entityType) {
        where.entityType = entityType;
      }
      if (actionType) {
        const actionMap = {
          'CREATE': 'create',
          'UPDATE': 'update',
          'DELETE': 'delete'
        };
        where.action = actionMap[actionType] || actionType.toLowerCase();
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const { count, rows: activities } = await AdminActivity.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'admin',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        raw: false
      });
      
      console.log('📋 [getActivities] Found', activities.length, 'activities');

      const formattedActivities = activities.map(activity => {
        const actionMap = {
          'create': 'CREATE',
          'update': 'UPDATE',
          'delete': 'DELETE'
        };

        return {
          id: activity.id,
          action_type: actionMap[activity.action] || activity.action.toUpperCase(),
          entity_type: activity.entityType,
          entity_name: activity.entityName,
          description: activity.description,
          admin_name: activity.admin ? `${activity.admin.firstName} ${activity.admin.lastName}` : 'Unknown',
          admin_id: activity.admin?.id || null,
          created_at: activity.createdAt,
          ip_address: activity.ipAddress || null,
          changes: activity.changes || {}
        };
      });

      res.json({
        activities: formattedActivities,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ [getActivities] Error:', error);
      console.error('❌ [getActivities] Error stack:', error.stack);
      res.status(500).json({
        error: error.message,
        activities: []
      });
    }
  }
}

module.exports = new AdminController();
