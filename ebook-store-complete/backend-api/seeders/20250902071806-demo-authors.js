'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('authors', [
      {
        id: 1,
        name: 'Nguyễn Du',
        bio: 'Nguyễn Du (1765-1820) là một nhà thơ lớn của văn học Việt Nam, tác giả của kiệt tác Truyện Kiều.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        birth_date: '1765-01-03',
        nationality: 'Việt Nam',
        website: null,
        social_links: JSON.stringify({}),
        books_count: 2,
        avg_rating: 4.8,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Napoleon Hill',
        bio: 'Napoleon Hill (1883-1970) là tác giả người Mỹ nổi tiếng với cuốn sách "Think and Grow Rich".',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        birth_date: '1883-10-26',
        nationality: 'Mỹ',
        website: 'https://www.naphill.org',
        social_links: JSON.stringify({
          facebook: 'napoleonhill',
          twitter: 'naphill'
        }),
        books_count: 3,
        avg_rating: 4.6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Robert C. Martin',
        bio: 'Robert Cecil Martin, thường được gọi là Uncle Bob, là một kỹ sư phần mềm và tác giả người Mỹ.',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        birth_date: '1952-12-05',
        nationality: 'Mỹ',
        website: 'http://cleancoder.com',
        social_links: JSON.stringify({
          twitter: 'unclebobmartin',
          linkedin: 'robert-cecil-martin'
        }),
        books_count: 4,
        avg_rating: 4.7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Haruki Murakami',
        bio: 'Haruki Murakami là một tiểu thuyết gia và dịch giả người Nhật Bản nổi tiếng thế giới.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        birth_date: '1949-01-12',
        nationality: 'Nhật Bản',
        website: null,
        social_links: JSON.stringify({}),
        books_count: 5,
        avg_rating: 4.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Yuval Noah Harari',
        bio: 'Yuval Noah Harari là sử gia và triết gia người Israel, tác giả của "Sapiens".',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        birth_date: '1976-02-24',
        nationality: 'Israel',
        website: 'https://www.ynharari.com',
        social_links: JSON.stringify({
          facebook: 'YuvalNoahHarari',
          twitter: 'harari_yuval'
        }),
        books_count: 3,
        avg_rating: 4.9,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Dale Carnegie',
        bio: 'Dale Carnegie (1888-1955) là tác giả và diễn giả người Mỹ, nổi tiếng với "How to Win Friends and Influence People".',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        birth_date: '1888-11-24',
        nationality: 'Mỹ',
        website: 'https://www.dalecarnegie.com',
        social_links: JSON.stringify({
          facebook: 'DaleCarnegieTraining'
        }),
        books_count: 2,
        avg_rating: 4.4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'Elon Musk',
        bio: 'Doanh nhân và kỹ sư người Nam Phi-Mỹ, CEO của Tesla và SpaceX.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        birth_date: '1971-06-28',
        nationality: 'Nam Phi / Mỹ',
        website: 'https://www.spacex.com',
        social_links: JSON.stringify({
          twitter: 'elonmusk'
        }),
        books_count: 1,
        avg_rating: 4.3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 8,
        name: 'Tố Hữu',
        bio: 'Tố Hữu (1920-2002) là nhà thơ cách mạng nổi tiếng của Việt Nam.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        birth_date: '1920-10-04',
        nationality: 'Việt Nam',
        website: null,
        social_links: JSON.stringify({}),
        books_count: 2,
        avg_rating: 4.6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('authors', null, {});
  }
};
