const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

class AuthController {
  // User registration
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        address
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        address,
        role: 'user',
        isVerified: false,
        verificationToken: AuthController.prototype.generateToken()
      });

      // Send verification email
      if (process.env.NODE_ENV === 'production') {
        await AuthController.prototype.sendVerificationEmail(user.email, user.verificationToken);
      }

      // Generate JWT token
      const token = AuthController.prototype.generateJWT(user);
      const refreshToken = AuthController.prototype.generateRefreshToken(user);

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng ký',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      console.log('🔵 Login attempt:', { email: email?.substring(0, 30), passwordLength: password?.length });

      // Find user - MySQL with utf8mb4_unicode_ci collation is case-insensitive
      const { Op } = require('sequelize');
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        console.log('❌ User not found for email:', email);
        // Try to find similar emails for debugging
        try {
          const emailPrefix = email.split('@')[0];
          const similarUsers = await User.findAll({
            where: {
              email: { [Op.like]: `%${emailPrefix}%` }
            },
            limit: 3,
            attributes: ['id', 'email']
          });
          if (similarUsers.length > 0) {
            console.log('🔍 Similar emails found:', similarUsers.map(u => u.email));
          }
        } catch (debugError) {
          console.log('Debug search error:', debugError.message);
        }
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      console.log('✅ User found:', { id: user.id, email: user.email, isActive: user.isActive });

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', user.email);
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị khóa'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const token = AuthController.prototype.generateJWT(user);
      const refreshToken = AuthController.prototype.generateRefreshToken(user);

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản với email này'
        });
      }

      // Generate 6-digit numeric code and short expiry (10 minutes)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.resetPasswordToken = resetCode;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Check if email service is configured
      const isEmailConfigured = process.env.GMAIL_USER && process.env.GMAIL_PASS;
      
      if (isEmailConfigured) {
        console.log(`✅ Gmail credentials found - Email will be sent`);
      } else {
        console.log(`⚠️ Gmail credentials not found - Code will be logged to console only`);
      }
      
      // Try to send email
      let emailSent = false;
      let emailError = null;
      
      if (isEmailConfigured) {
        try {
          console.log(`🔄 Starting email send process for ${user.email}...`);
          await AuthController.prototype.sendPasswordResetCodeEmail(user.email, resetCode);
          emailSent = true;
          console.log(`✅ Email sent successfully to ${user.email}`);
        } catch (err) {
          emailError = err;
          console.error('❌ Email sending failed:', err.message);
          console.error('Error details:', {
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode
          });
          
          // In production, throw error to notify user
          if (process.env.NODE_ENV === 'production') {
            throw err;
          }
          // In development, log error but continue
        }
      }

      // In development or when email is not configured, log to console
      if (!emailSent || process.env.NODE_ENV === 'development') {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📧 PASSWORD RESET CODE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`📬 Email: ${user.email}`);
        console.log(`🔑 Reset Code: ${resetCode}`);
        console.log(`⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
        console.log('═══════════════════════════════════════════════════════════\n');
      }

      // Generate forgot password token (JWT) - expires in 10 minutes
      const forgotPasswordToken = jwt.sign(
        { 
          email: user.email,
          type: 'forgot_password'
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      const response = {
        success: true,
        message: emailSent 
          ? 'Mã khôi phục đã được gửi đến email của bạn'
          : 'Mã khôi phục đã được tạo. Vui lòng kiểm tra console server để lấy mã.',
        data: {
          token: forgotPasswordToken
        }
      };

      // In development mode, include code and error info in response for testing
      if (process.env.NODE_ENV === 'development') {
        if (!emailSent) {
          response.debug = {
            resetCode: resetCode,
            emailConfigured: isEmailConfigured,
            emailError: emailError ? {
              message: emailError.message,
              code: emailError.code,
              responseCode: emailError.responseCode
            } : null,
            message: emailError 
              ? 'Email gửi thất bại. Xem chi tiết lỗi trong emailError.'
              : 'Email service not configured. Code displayed for development.'
          };
        }
      } else if (emailError) {
        // In production, if email fails, still return success but log error
        response.message = `Mã khôi phục đã được tạo nhưng không thể gửi email: ${emailError.message}`;
      }

      res.json(response);

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xử lý yêu cầu đặt lại mật khẩu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify forgot password OTP
  async verifyForgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { token, otpCode } = req.body;

      // Decode forgot password token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'forgot_password') {
          return res.status(400).json({
            success: false,
            message: 'Token không hợp lệ'
          });
        }
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      const email = decoded.email;
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Verify OTP code
      if (!user.resetPasswordToken || user.resetPasswordToken !== otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP không đúng'
        });
      }

      if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP đã hết hạn'
        });
      }

      // Mark OTP as used
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      // Generate verify token for password reset (expires in 15 minutes)
      const verifyToken = jwt.sign(
        {
          email: user.email,
          type: 'reset_password'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        message: 'Mã OTP đã được xác thực thành công',
        data: {
          token: verifyToken
        }
      });

    } catch (error) {
      console.error('Verify forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xác thực mã OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      // Decode verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'reset_password') {
          return res.status(400).json({
            success: false,
            message: 'Token không hợp lệ'
          });
        }
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      const email = decoded.email;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Update password
      user.password = password;
      await user.save();

      res.json({
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đặt lại mật khẩu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Change password (authenticated user)
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi thay đổi mật khẩu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: { verificationToken: token }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token xác thực không hợp lệ'
        });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      res.json({
        success: true,
        message: 'Email đã được xác thực thành công'
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xác thực email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token không hợp lệ'
        });
      }

      // Generate new tokens
      const newToken = AuthController.prototype.generateJWT(user);
      const newRefreshToken = AuthController.prototype.generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper methods
  generateJWT(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }

  generateToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email, token) {
    console.log(`Verification email sent to ${email} with token: ${token}`);
  }

  async sendPasswordResetCodeEmail(email, code) {
    // Check if email credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn('⚠️ Gmail credentials not found in environment variables');
      throw new Error('Email service not configured');
    }

    console.log(`📧 Attempting to send password reset code to ${email}...`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      throw new Error('Không thể kết nối đến dịch vụ email. Vui lòng kiểm tra cấu hình Gmail.');
    }

    // Get sender name from env or use default
    const senderName = process.env.EMAIL_SENDER_NAME || 'EBook Store';
    const senderEmail = process.env.GMAIL_USER;

    const mailOptions = {
      from: {
        name: senderName,
        address: senderEmail
      },
      to: email,
      subject: 'Mã khôi phục mật khẩu',
      text: `Mã khôi phục của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Khôi phục mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6B7280;">Mã khôi phục của bạn:</p>
            <p style="font-size: 32px; font-weight: bold; color: #2563EB; margin: 10px 0; letter-spacing: 4px;">${code}</p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset code sent successfully to ${email}`);
      console.log(`📬 Message ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('❌ Send reset code email error:', err);
      
      // Provide more specific error messages
      if (err.code === 'EAUTH') {
        throw new Error('Xác thực Gmail thất bại. Vui lòng kiểm tra GMAIL_USER và GMAIL_PASS trong file .env');
      } else if (err.code === 'ECONNECTION') {
        throw new Error('Không thể kết nối đến SMTP server. Vui lòng kiểm tra kết nối internet.');
      } else if (err.responseCode === 535) {
        throw new Error('Tài khoản Gmail không hợp lệ hoặc chưa bật "Less secure app access". Vui lòng sử dụng App Password.');
      }
      
      throw new Error(`Không thể gửi email khôi phục: ${err.message}`);
    }
  }
}

module.exports = new AuthController();
