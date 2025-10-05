const { param, query } = require('express-validator');

const getBookByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID sách phải là số nguyên dương')
];

const getBooksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100'),
  
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID danh mục phải là số nguyên dương'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'popular'])
    .withMessage('Sắp xếp không hợp lệ'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá tối thiểu phải là số dương'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá tối đa phải là số dương')
];

const searchBooksValidation = [
  query('q')
    .notEmpty()
    .withMessage('Từ khóa tìm kiếm không được để trống')
    .isLength({ min: 1, max: 100 })
    .withMessage('Từ khóa tìm kiếm từ 1-100 ký tự'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100')
];

module.exports = {
  getBookByIdValidation,
  getBooksValidation,
  searchBooksValidation
};
