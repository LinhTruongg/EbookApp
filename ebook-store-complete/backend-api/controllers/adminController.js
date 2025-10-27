const { Book, User, Category, Comment, Review, UserLibrary } = require('../models');
const { Op } = require('sequelize');

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
}

module.exports = new AdminController();
