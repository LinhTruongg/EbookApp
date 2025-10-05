'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('book_authors', [
      // Technology Books
      {
        book_id: 1, // JavaScript từ Cơ bản đến Nâng cao
        author_id: 3, // Robert C. Martin
        role: 'author',
      },
      {
        book_id: 2, // React Native Development Guide
        author_id: 3, // Robert C. Martin
        role: 'author',
      },
      {
        book_id: 3, // Database Design Principles
        author_id: 2, // Napoleon Hill
        role: 'author',
      },
      
      // Business Books
      {
        book_id: 4, // Digital Marketing Mastery
        author_id: 4, // Haruki Murakami
        role: 'author',
      },
      {
        book_id: 5, // Startup Success Stories
        author_id: 5, // Yuval Noah Harari
        role: 'author',
      },
      
      // Literature Books
      {
        book_id: 6, // Những Ngày Thơ Ấu
        author_id: 6, // Dale Carnegie
        role: 'author',
      },
      {
        book_id: 7, // The Art of Storytelling
        author_id: 7, // Elon Musk
        role: 'author',
      },
      
      // Science & Education Books
      {
        book_id: 8, // Trí tuệ nhân tạo và Tương lai
        author_id: 8, // Tố Hữu
        role: 'author',
      },
      {
        book_id: 9, // Learning How to Learn
        author_id: 5, // Yuval Noah Harari
        role: 'author',
      },
      
      // Some books with multiple authors
      {
        book_id: 1, // JavaScript từ Cơ bản đến Nâng cao
        author_id: 1, // Nguyễn Du (co-author)
        role: 'co_author',
      },
      {
        book_id: 4, // Digital Marketing Mastery
        author_id: 2, // Napoleon Hill (co-author)
        role: 'co_author',
      },
      {
        book_id: 8, // Trí tuệ nhân tạo và Tương lai
        author_id: 1, // Nguyễn Du (co-author)
        role: 'co_author',
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('book_authors', null, {});
  }
};
