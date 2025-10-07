'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_libraries', [
      // User 2 (Nguyễn Văn An) - 5 books purchased, total spent: 450,000 VND
      {
        user_id: 2,
        book_id: 1, // JavaScript từ Cơ bản đến Nâng cao
        purchase_date: new Date('2024-01-20'),
        price_paid: 249000.00, // discount price
        access_type: 'purchased',
        download_count: 3,
        max_downloads: -1,
        reading_progress: 75,
        current_page: 338,
        last_read_at: new Date('2024-03-15'),
        is_favorite: true,
        reading_time_minutes: 480,
        notes: 'Cuốn sách rất hay về JavaScript, đặc biệt phần ES6+',
        created_at: new Date('2024-01-20'),
        updated_at: new Date('2024-03-15')
      },
      {
        user_id: 2,
        book_id: 4, // Digital Marketing Mastery
        purchase_date: new Date('2024-02-01'),
        price_paid: 229000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 320,
        last_read_at: new Date('2024-02-28'),
        is_favorite: false,
        reading_time_minutes: 360,
        notes: null,
        created_at: new Date('2024-02-01'),
        updated_at: new Date('2024-02-28')
      },
      {
        user_id: 2,
        book_id: 6, // Những Ngày Thơ Ấu
        purchase_date: new Date('2024-02-15'),
        price_paid: 69000.00, // discount price
        access_type: 'purchased',
        download_count: 2,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 180,
        last_read_at: new Date('2024-02-20'),
        is_favorite: true,
        reading_time_minutes: 240,
        notes: 'Tác phẩm văn học kinh điển, rất cảm động',
        created_at: new Date('2024-02-15'),
        updated_at: new Date('2024-02-20')
      },
      {
        user_id: 2,
        book_id: 8, // Trí tuệ nhân tạo và Tương lai
        purchase_date: new Date('2024-03-01'),
        price_paid: 159000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 45,
        current_page: 99,
        last_read_at: new Date('2024-03-10'),
        is_favorite: false,
        reading_time_minutes: 180,
        notes: null,
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-10')
      },
      {
        user_id: 2,
        book_id: 9, // Learning How to Learn
        purchase_date: new Date('2024-03-05'),
        price_paid: 239000.00, // discount price
        access_type: 'purchased',
        download_count: 0,
        max_downloads: -1,
        reading_progress: 0,
        current_page: 1,
        last_read_at: null,
        is_favorite: false,
        reading_time_minutes: 0,
        notes: null,
        created_at: new Date('2024-03-05'),
        updated_at: new Date('2024-03-05')
      },

      // User 3 (Trần Thị Bình) - 3 books purchased, total spent: 320,000 VND
      {
        user_id: 3,
        book_id: 2, // React Native Development Guide
        purchase_date: new Date('2024-01-25'),
        price_paid: 399000.00, // full price
        access_type: 'purchased',
        download_count: 2,
        max_downloads: -1,
        reading_progress: 60,
        current_page: 228,
        last_read_at: new Date('2024-03-12'),
        is_favorite: true,
        reading_time_minutes: 420,
        notes: 'Hướng dẫn chi tiết về React Native, rất hữu ích cho công việc',
        created_at: new Date('2024-01-25'),
        updated_at: new Date('2024-03-12')
      },
      {
        user_id: 3,
        book_id: 7, // Cuộc Đời Của Pi
        purchase_date: new Date('2024-02-10'),
        price_paid: 119000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 250,
        last_read_at: new Date('2024-02-25'),
        is_favorite: true,
        reading_time_minutes: 300,
        notes: 'Câu chuyện rất hay và ý nghĩa',
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-02-25')
      },
      {
        user_id: 3,
        book_id: 9, // Learning How to Learn
        purchase_date: new Date('2024-02-20'),
        price_paid: 239000.00, // discount price
        access_type: 'purchased',
        download_count: 3,
        max_downloads: -1,
        reading_progress: 30,
        current_page: 90,
        last_read_at: new Date('2024-03-08'),
        is_favorite: false,
        reading_time_minutes: 150,
        notes: null,
        created_at: new Date('2024-02-20'),
        updated_at: new Date('2024-03-08')
      },

      // User 4 (Lê Minh Cường) - 8 books purchased, total spent: 680,000 VND
      {
        user_id: 4,
        book_id: 1, // JavaScript từ Cơ bản đến Nâng cao
        purchase_date: new Date('2024-01-15'),
        price_paid: 249000.00, // discount price
        access_type: 'purchased',
        download_count: 5,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 450,
        last_read_at: new Date('2024-02-15'),
        is_favorite: true,
        reading_time_minutes: 600,
        notes: 'Sách hay, đã áp dụng được nhiều kiến thức vào dự án',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-02-15')
      },
      {
        user_id: 4,
        book_id: 2, // React Native Development Guide
        purchase_date: new Date('2024-01-18'),
        price_paid: 399000.00, // full price
        access_type: 'purchased',
        download_count: 2,
        max_downloads: -1,
        reading_progress: 85,
        current_page: 323,
        last_read_at: new Date('2024-03-14'),
        is_favorite: false,
        reading_time_minutes: 480,
        notes: null,
        created_at: new Date('2024-01-18'),
        updated_at: new Date('2024-03-14')
      },
      {
        user_id: 4,
        book_id: 3, // Database Design Principles
        purchase_date: new Date('2024-01-22'),
        price_paid: 299000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 70,
        current_page: 294,
        last_read_at: new Date('2024-03-05'),
        is_favorite: true,
        reading_time_minutes: 360,
        notes: 'Kiến thức database rất cần thiết',
        created_at: new Date('2024-01-22'),
        updated_at: new Date('2024-03-05')
      },
      {
        user_id: 4,
        book_id: 4, // Digital Marketing Mastery
        purchase_date: new Date('2024-02-05'),
        price_paid: 229000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 50,
        current_page: 160,
        last_read_at: new Date('2024-02-28'),
        is_favorite: false,
        reading_time_minutes: 200,
        notes: null,
        created_at: new Date('2024-02-05'),
        updated_at: new Date('2024-02-28')
      },
      {
        user_id: 4,
        book_id: 5, // Startup Success Stories
        purchase_date: new Date('2024-02-12'),
        price_paid: 329000.00, // full price
        access_type: 'purchased',
        download_count: 2,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 280,
        last_read_at: new Date('2024-03-01'),
        is_favorite: true,
        reading_time_minutes: 420,
        notes: 'Rất nhiều bài học từ các startup thành công',
        created_at: new Date('2024-02-12'),
        updated_at: new Date('2024-03-01')
      },
      {
        user_id: 4,
        book_id: 6, // Những Ngày Thơ Ấu
        purchase_date: new Date('2024-02-18'),
        price_paid: 69000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 100,
        current_page: 180,
        last_read_at: new Date('2024-02-22'),
        is_favorite: false,
        reading_time_minutes: 180,
        notes: null,
        created_at: new Date('2024-02-18'),
        updated_at: new Date('2024-02-22')
      },
      {
        user_id: 4,
        book_id: 8, // Trí tuệ nhân tạo và Tương lai
        purchase_date: new Date('2024-02-25'),
        price_paid: 159000.00, // discount price
        access_type: 'purchased',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 80,
        current_page: 176,
        last_read_at: new Date('2024-03-13'),
        is_favorite: true,
        reading_time_minutes: 240,
        notes: 'Cái nhìn thú vị về tương lai AI',
        created_at: new Date('2024-02-25'),
        updated_at: new Date('2024-03-13')
      },
      {
        user_id: 4,
        book_id: 9, // Learning How to Learn
        purchase_date: new Date('2024-03-02'),
        price_paid: 239000.00, // discount price
        access_type: 'purchased',
        download_count: 0,
        max_downloads: -1,
        reading_progress: 15,
        current_page: 45,
        last_read_at: new Date('2024-03-10'),
        is_favorite: false,
        reading_time_minutes: 60,
        notes: null,
        created_at: new Date('2024-03-02'),
        updated_at: new Date('2024-03-10')
      },

      // Admin user (id: 1) - có một vài sách để test
      {
        user_id: 1,
        book_id: 1, // JavaScript từ Cơ bản đến Nâng cao
        purchase_date: new Date('2024-01-10'),
        price_paid: 0.00, // admin gets free access
        access_type: 'free',
        download_count: 1,
        max_downloads: -1,
        reading_progress: 25,
        current_page: 113,
        last_read_at: new Date('2024-01-15'),
        is_favorite: false,
        reading_time_minutes: 120,
        notes: 'Kiểm tra chất lượng nội dung',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-15')
      },
      {
        user_id: 1,
        book_id: 8, // Trí tuệ nhân tạo và Tương lai
        purchase_date: new Date('2024-02-15'),
        price_paid: 0.00, // admin gets free access
        access_type: 'free',
        download_count: 0,
        max_downloads: -1,
        reading_progress: 0,
        current_page: 1,
        last_read_at: null,
        is_favorite: false,
        reading_time_minutes: 0,
        notes: null,
        created_at: new Date('2024-02-15'),
        updated_at: new Date('2024-02-15')
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_libraries', null, {});
  }
};
