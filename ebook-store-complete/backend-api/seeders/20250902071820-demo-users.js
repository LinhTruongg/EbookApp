'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 12);
    const adminPassword = await bcrypt.hash('admin123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@ebookstore.com',
        password: adminPassword,
        phone: '0123456789',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        date_of_birth: '1990-01-01',
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        role: 'admin',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: new Date(),
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 16,
          fontFamily: 'default',
          lineHeight: 1.5
        }),
        favorite_categories: JSON.stringify([7, 4, 10]),
        total_spent: 0.00,
        books_purchased: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        first_name: 'Nguyễn',
        last_name: 'Văn An',
        email: 'nguyenvanan@gmail.com',
        password: hashedPassword,
        phone: '0987654321',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        date_of_birth: '1995-05-15',
        gender: 'male',
        address: 'TP.HCM, Việt Nam',
        role: 'user',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: new Date(),
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 18,
          fontFamily: 'serif',
          lineHeight: 1.6
        }),
        favorite_categories: JSON.stringify([1, 4, 7]),
        total_spent: 450000.00,
        books_purchased: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        first_name: 'Trần',
        last_name: 'Thị Bình',
        email: 'tranbinhtt@gmail.com',
        password: hashedPassword,
        phone: '0912345678',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
        date_of_birth: '1992-08-20',
        gender: 'female',
        address: 'Đà Nẵng, Việt Nam',
        role: 'user',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: new Date(),
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'dark',
          fontSize: 16,
          fontFamily: 'sans-serif',
          lineHeight: 1.5
        }),
        favorite_categories: JSON.stringify([1, 10, 12]),
        total_spent: 320000.00,
        books_purchased: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        first_name: 'Lê',
        last_name: 'Minh Cường',
        email: 'leminhcuong@gmail.com',
        password: hashedPassword,
        phone: '0934567890',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        date_of_birth: '1988-12-10',
        gender: 'male',
        address: 'Hải Phòng, Việt Nam',
        role: 'user',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: new Date(),
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 14,
          fontFamily: 'default',
          lineHeight: 1.4
        }),
        favorite_categories: JSON.stringify([4, 7, 13]),
        total_spent: 680000.00,
        books_purchased: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        first_name: 'Phạm',
        last_name: 'Thu Dung',
        email: 'phamthudung@gmail.com',
        password: hashedPassword,
        phone: '0956789012',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        date_of_birth: '1997-03-25',
        gender: 'female',
        address: 'Cần Thơ, Việt Nam',
        role: 'user',
        is_verified: false,
        verification_token: 'verify_token_123',
        reset_password_token: null,
        reset_password_expires: null,
        last_login: null,
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 16,
          fontFamily: 'default',
          lineHeight: 1.5
        }),
        favorite_categories: JSON.stringify([]),
        total_spent: 0.00,
        books_purchased: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
