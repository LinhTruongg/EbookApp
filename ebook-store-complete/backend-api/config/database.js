require('dotenv').config();

// Debug: Log environment variables (hide password)
console.log('🔍 Database Config Debug:', {
  DB_USERNAME: process.env.DB_USERNAME || 'NOT SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
  DB_NAME: process.env.DB_NAME || 'NOT SET',
  DB_HOST: process.env.DB_HOST || 'NOT SET',
  DB_PORT: process.env.DB_PORT || 'NOT SET',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ebook_store_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      paranoid: false
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ebook_store_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
