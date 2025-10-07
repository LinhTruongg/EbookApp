'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('book_authors', [
      {
        book_id: 1,
        author_id: 3,
        role: 'author',
      },
      {
        book_id: 2,
        author_id: 3,
        role: 'author',
      },
      {
        book_id: 3,
        author_id: 2,
        role: 'author',
      },
      {
        book_id: 4,
        author_id: 4,
        role: 'author',
      },
      {
        book_id: 5,
        author_id: 5,
        role: 'author',
      },
      {
        book_id: 6,
        author_id: 6,
        role: 'author',
      },
      {
        book_id: 7,
        author_id: 7,
        role: 'author',
      },
      {
        book_id: 8,
        author_id: 8,
        role: 'author',
      },
      {
        book_id: 9,
        author_id: 5,
        role: 'author',
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('book_authors', null, {});
  }
};
