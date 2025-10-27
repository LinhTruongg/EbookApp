'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [
      // Technology Books
      {
        id: 1,
        title: 'JavaScript từ Cơ bản đến Nâng cao',
        subtitle: 'Học lập trình JavaScript một cách toàn diện',
        isbn: '978-604-123-456-7',
        description: 'Cuốn sách cung cấp kiến thức JavaScript từ cơ bản đến nâng cao, bao gồm ES6+, DOM manipulation, async programming và modern JavaScript patterns. Phù hợp cho cả người mới bắt đầu và developer có kinh nghiệm.',
        cover_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        price: 299000.00,
        discount_price: 249000.00,
        category_id: 8, // Lập trình
        publisher: 'NXB Công nghệ',
        publication_date: '2024-01-15',
        page_count: 450,
        language: 'vi',
        file_url: 'https://example.com/books/javascript-advanced.pdf',
        file_size: 15728640, // 15MB
        preview_url: 'https://example.com/books/javascript-advanced-preview.pdf',
        sample_pages: 25,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: true,
        is_bestseller: false,
        is_new_release: true,
        tags: JSON.stringify(['javascript', 'programming', 'web-development', 'es6']),
        metadata: JSON.stringify({
          difficulty: 'intermediate',
          target_audience: 'developers',
          prerequisites: ['basic programming knowledge']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        title: 'React Native Development Guide',
        subtitle: 'Build Mobile Apps with React Native',
        isbn: '978-604-123-456-8',
        description: 'Comprehensive guide to building mobile applications using React Native. Covers everything from setup to deployment, including state management, navigation, and native module integration.',
        cover_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        price: 399000.00,
        discount_price: null,
        category_id: 8, // Lập trình
        publisher: 'Tech Publishing',
        publication_date: '2024-02-20',
        page_count: 380,
        language: 'en',
        file_url: 'https://example.com/books/react-native-guide.pdf',
        file_size: 20971520, // 20MB
        preview_url: 'https://example.com/books/react-native-guide-preview.pdf',
        sample_pages: 30,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: true,
        is_new_release: false,
        tags: JSON.stringify(['react-native', 'mobile-development', 'javascript', 'ios', 'android']),
        metadata: JSON.stringify({
          difficulty: 'intermediate',
          target_audience: 'mobile developers',
          prerequisites: ['react', 'javascript']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        title: 'Database Design Principles',
        subtitle: 'From Theory to Practice',
        isbn: '978-604-123-456-9',
        description: 'Learn the fundamentals of database design, normalization, and optimization. This book covers both relational and NoSQL databases with practical examples and real-world scenarios.',
        cover_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        price: 349000.00,
        discount_price: 299000.00,
        category_id: 8, // Lập trình
        publisher: 'Data Science Press',
        publication_date: '2024-01-10',
        page_count: 420,
        language: 'en',
        file_url: 'https://example.com/books/database-design.pdf',
        file_size: 18874368, // 18MB
        preview_url: 'https://example.com/books/database-design-preview.pdf',
        sample_pages: 35,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: false,
        is_new_release: false,
        tags: JSON.stringify(['database', 'sql', 'nosql', 'design', 'optimization']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'database administrators',
          prerequisites: ['basic computer science']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Business Books
      {
        id: 4,
        title: 'Digital Marketing Mastery',
        subtitle: 'Chiến lược Marketing số trong thời đại 4.0',
        isbn: '978-604-123-456-0',
        description: 'Cuốn sách cung cấp các chiến lược marketing số hiệu quả, bao gồm SEO, social media marketing, content marketing và email marketing. Với case study thực tế từ các thương hiệu lớn.',
        cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        price: 279000.00,
        discount_price: 229000.00,
        category_id: 4, // Kinh tế - Kinh doanh
        publisher: 'NXB Kinh tế',
        publication_date: '2024-03-01',
        page_count: 320,
        language: 'vi',
        file_url: 'https://example.com/books/digital-marketing.pdf',
        file_size: 12582912, // 12MB
        preview_url: 'https://example.com/books/digital-marketing-preview.pdf',
        sample_pages: 20,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: true,
        is_bestseller: true,
        is_new_release: false,
        tags: JSON.stringify(['marketing', 'digital', 'seo', 'social-media', 'business']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'marketers',
          prerequisites: ['basic business knowledge']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        title: 'Startup Success Stories',
        subtitle: 'Lessons from Silicon Valley Entrepreneurs',
        isbn: '978-604-123-456-1',
        description: 'Discover the secrets behind successful startups through interviews and case studies of Silicon Valley entrepreneurs. Learn about funding, scaling, and building sustainable businesses.',
        cover_image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
        price: 329000.00,
        discount_price: null,
        category_id: 5, // Khởi nghiệp
        publisher: 'Entrepreneur Press',
        publication_date: '2024-02-15',
        page_count: 280,
        language: 'en',
        file_url: 'https://example.com/books/startup-success.pdf',
        file_size: 14680064, // 14MB
        preview_url: 'https://example.com/books/startup-success-preview.pdf',
        sample_pages: 25,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: false,
        is_new_release: true,
        tags: JSON.stringify(['startup', 'entrepreneurship', 'business', 'silicon-valley']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'entrepreneurs',
          prerequisites: ['business interest']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Literature Books
      {
        id: 6,
        title: 'Những Ngày Thơ Ấu',
        subtitle: 'Hồi ký tuổi thơ',
        isbn: '978-604-123-456-2',
        description: 'Tác phẩm văn học kinh điển của nhà văn Nguyên Hồng, kể về tuổi thơ đầy khó khăn nhưng cũng rất đẹp đẽ của tác giả. Cuốn sách đã được đưa vào chương trình giảng dạy văn học.',
        cover_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        price: 89000.00,
        discount_price: 69000.00,
        category_id: 2, // Tiểu thuyết
        publisher: 'NXB Văn học',
        publication_date: '2023-12-01',
        page_count: 180,
        language: 'vi',
        file_url: 'https://example.com/books/nhung-ngay-tho-au.pdf',
        file_size: 5242880, // 5MB
        preview_url: 'https://example.com/books/nhung-ngay-tho-au-preview.pdf',
        sample_pages: 15,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: true,
        is_new_release: false,
        tags: JSON.stringify(['văn học', 'hồi ký', 'tuổi thơ', 'việt nam']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'general readers',
          prerequisites: ['none']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        title: 'The Art of Storytelling',
        subtitle: 'Crafting Compelling Narratives',
        isbn: '978-604-123-456-3',
        description: 'Master the art of storytelling with practical techniques and exercises. Learn how to create engaging narratives that captivate your audience, whether in writing, speaking, or business.',
        cover_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        price: 259000.00,
        discount_price: null,
        category_id: 1, // Văn học
        publisher: 'Creative Writing Press',
        publication_date: '2024-01-20',
        page_count: 250,
        language: 'en',
        file_url: 'https://example.com/books/storytelling.pdf',
        file_size: 10485760, // 10MB
        preview_url: 'https://example.com/books/storytelling-preview.pdf',
        sample_pages: 20,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: false,
        is_new_release: false,
        tags: JSON.stringify(['storytelling', 'writing', 'narrative', 'creative']),
        metadata: JSON.stringify({
          difficulty: 'intermediate',
          target_audience: 'writers',
          prerequisites: ['basic writing skills']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Science & Education Books
      {
        id: 8,
        title: 'Trí tuệ nhân tạo và Tương lai',
        subtitle: 'AI trong cuộc sống hàng ngày',
        isbn: '978-604-123-456-4',
        description: 'Cuốn sách giải thích về trí tuệ nhân tạo một cách dễ hiểu, từ khái niệm cơ bản đến ứng dụng thực tế. Dự đoán về tương lai của AI và tác động đến xã hội.',
        cover_image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400',
        price: 199000.00,
        discount_price: 159000.00,
        category_id: 9, // Trí tuệ nhân tạo
        publisher: 'NXB Khoa học',
        publication_date: '2024-02-10',
        page_count: 220,
        language: 'vi',
        file_url: 'https://example.com/books/ai-future.pdf',
        file_size: 8388608, // 8MB
        preview_url: 'https://example.com/books/ai-future-preview.pdf',
        sample_pages: 18,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: true,
        is_bestseller: false,
        is_new_release: true,
        tags: JSON.stringify(['ai', 'trí tuệ nhân tạo', 'khoa học', 'tương lai']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'general readers',
          prerequisites: ['none']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        title: 'Learning How to Learn',
        subtitle: 'Powerful Mental Tools to Help You Master Tough Subjects',
        isbn: '978-604-123-456-5',
        description: 'Based on the popular online course, this book teaches you how to learn effectively using proven techniques from neuroscience and cognitive psychology.',
        cover_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
        price: 289000.00,
        discount_price: 239000.00,
        category_id: 11, // Phát triển bản thân
        publisher: 'Educational Press',
        publication_date: '2024-01-05',
        page_count: 300,
        language: 'en',
        file_url: 'https://example.com/books/learning-how-to-learn.pdf',
        file_size: 11534336, // 11MB
        preview_url: 'https://example.com/books/learning-how-to-learn-preview.pdf',
        sample_pages: 22,
        rating: 0.00,
        total_reviews: 0,
        total_purchases: 0,
        total_revenue: 0.00,
        is_featured: false,
        is_bestseller: true,
        is_new_release: false,
        tags: JSON.stringify(['learning', 'education', 'neuroscience', 'psychology']),
        metadata: JSON.stringify({
          difficulty: 'beginner',
          target_audience: 'students',
          prerequisites: ['none']
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', null, {});
  }
};
