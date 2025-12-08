const { body } = require('express-validator');

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Họ không được để trống')
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ phải từ 1-50 ký tự'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Tên không được để trống')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên phải từ 1-50 ký tự'),
  
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
  
  body('otpToken')
    .notEmpty()
    .withMessage('Token xác thực OTP là bắt buộc'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      const phoneRegex = /^0[0-9]{9,10}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0');
      }
      return true;
    }),
  
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
  
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      if (!iso8601Regex.test(value)) {
        throw new Error('Ngày sinh không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD');
      }
      return true;
    }),
  
  body('address')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      if (value.length > 255) {
        throw new Error('Địa chỉ không được quá 255 ký tự');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Tài khoản không được bỏ trống')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
];

const verifyForgotPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token không được để trống'),
  
  body('otpCode')
    .notEmpty()
    .withMessage('Mã OTP không được để trống')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã OTP phải có đúng 6 chữ số')
    .matches(/^\d{6}$/)
    .withMessage('Mã OTP phải là 6 chữ số')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token không được để trống'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
];

const sendRegistrationOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
];

const verifyRegistrationOTPValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token không được để trống'),
  
  body('otpCode')
    .notEmpty()
    .withMessage('Mã OTP không được để trống')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã OTP phải có đúng 6 chữ số')
    .matches(/^\d{6}$/)
    .withMessage('Mã OTP phải là 6 chữ số')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyForgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  sendRegistrationOTPValidation,
  verifyRegistrationOTPValidation
};
