'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const defaultPassword = await bcrypt.hash('123456', 12);

    const now = new Date();

    const users = [
      {
        first_name: 'Huỳnh',
        last_name: 'Linh',
        email: 'linh.demo+1@ebookstore.com',
        password: defaultPassword,
        phone: '0900000001',
        avatar: null,
        date_of_birth: '1996-06-15',
        gender: 'female',
        address: 'Hà Nội, Việt Nam',
        role: 'user',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: now,
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 16,
          fontFamily: 'default',
          lineHeight: 1.5,
        }),
        favorite_categories: JSON.stringify([1, 4, 7]),
        total_spent: 0.00,
        books_purchased: 0,
        points: 120,
        created_at: now,
        updated_at: now,
      },
      {
        first_name: 'Phan',
        last_name: 'Thái',
        email: 'thai.demo+2@ebookstore.com',
        password: defaultPassword,
        phone: '0900000002',
        avatar: null,
        date_of_birth: '1994-03-20',
        gender: 'male',
        address: 'TP.HCM, Việt Nam',
        role: 'user',
        is_verified: true,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        last_login: now,
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'dark',
          fontSize: 18,
          fontFamily: 'serif',
          lineHeight: 1.6,
        }),
        favorite_categories: JSON.stringify([3, 5, 9]),
        total_spent: 0.00,
        books_purchased: 0,
        points: 80,
        created_at: now,
        updated_at: now,
      },
      {
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo.user+3@ebookstore.com',
        password: defaultPassword,
        phone: '0900000003',
        avatar: null,
        date_of_birth: '2000-01-01',
        gender: 'other',
        address: 'Đà Nẵng, Việt Nam',
        role: 'user',
        is_verified: false,
        verification_token: 'verify_token_demo',
        reset_password_token: null,
        reset_password_expires: null,
        last_login: null,
        is_active: true,
        reading_preferences: JSON.stringify({
          theme: 'light',
          fontSize: 15,
          fontFamily: 'default',
          lineHeight: 1.5,
        }),
        favorite_categories: JSON.stringify([]),
        total_spent: 0.00,
        books_purchased: 0,
        points: 0,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('users', users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: [
        'linh.demo+1@ebookstore.com',
        'thai.demo+2@ebookstore.com',
        'demo.user+3@ebookstore.com',
      ],
    });
  },
};


