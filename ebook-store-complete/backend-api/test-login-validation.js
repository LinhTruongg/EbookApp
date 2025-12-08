require('dotenv').config();
const axios = require('axios');

async function testLoginValidation() {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🧪 TEST LOGIN VALIDATION');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const baseURL = process.env.API_URL || 'http://localhost:3000/api';
    
    console.log('📋 Environment check:');
    console.log('  - Base URL:', baseURL);
    console.log('');
    
    // Test case 1: Email trống
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Test Case 1: Đăng nhập với tài khoản (email) bỏ trống');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const response = await axios.post(
        `${baseURL}/auth/login`,
        {
          email: '',
          password: '123456'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: () => true
        }
      );
      
      console.log('📤 Request sent:');
      console.log('  Email: "" (empty)');
      console.log('  Password: "123456"');
      console.log('');
      
      console.log('📥 Response received:');
      console.log('  Status:', response.status);
      console.log('  Success:', response.data.success);
      console.log('  Message:', response.data.message);
      
      if (response.data.errors && response.data.errors.length > 0) {
        console.log('  Validation Errors:');
        response.data.errors.forEach((error, index) => {
          console.log(`    ${index + 1}. ${error.msg} (field: ${error.param})`);
        });
      }
      console.log('');
      
      // Kiểm tra kết quả
      if (response.status === 400 && 
          response.data.success === false &&
          response.data.errors &&
          response.data.errors.some(err => 
            err.param === 'email' && 
            err.msg.includes('Tài khoản không được bỏ trống')
          )) {
        console.log('✅ TEST PASSED: Thông báo "Tài khoản không được bỏ trống" được trả về đúng');
      } else {
        console.log('❌ TEST FAILED: Không nhận được thông báo mong đợi');
        console.log('   Expected: Status 400, message "Tài khoản không được bỏ trống"');
      }
      
    } catch (error) {
      console.error('❌ Test failed with exception:');
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('  Error:', error.message);
      }
    }
    
    console.log('\n');
    
    // Test case 2: Email chỉ có khoảng trắng
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Test Case 2: Đăng nhập với tài khoản chỉ có khoảng trắng');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const response = await axios.post(
        `${baseURL}/auth/login`,
        {
          email: '   ',
          password: '123456'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: () => true
        }
      );
      
      console.log('📤 Request sent:');
      console.log('  Email: "   " (whitespace only)');
      console.log('  Password: "123456"');
      console.log('');
      
      console.log('📥 Response received:');
      console.log('  Status:', response.status);
      console.log('  Success:', response.data.success);
      console.log('  Message:', response.data.message);
      
      if (response.data.errors && response.data.errors.length > 0) {
        console.log('  Validation Errors:');
        response.data.errors.forEach((error, index) => {
          console.log(`    ${index + 1}. ${error.msg} (field: ${error.param})`);
        });
      }
      console.log('');
      
      if (response.status === 400 && 
          response.data.success === false &&
          response.data.errors &&
          response.data.errors.some(err => 
            err.param === 'email' && 
            (err.msg.includes('Tài khoản không được bỏ trống') || err.msg.includes('Email không hợp lệ'))
          )) {
        console.log('✅ TEST PASSED: Thông báo lỗi validation được trả về đúng');
      } else {
        console.log('❌ TEST FAILED: Không nhận được thông báo mong đợi');
      }
      
    } catch (error) {
      console.error('❌ Test failed with exception:');
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('  Error:', error.message);
      }
    }
    
    console.log('\n');
    
    // Test case 3: Email hợp lệ (để so sánh)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Test Case 3: Đăng nhập với email hợp lệ (để so sánh)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const response = await axios.post(
        `${baseURL}/auth/login`,
        {
          email: 'nguyenvanan@gmail.com',
          password: '123456'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: () => true
        }
      );
      
      console.log('📤 Request sent:');
      console.log('  Email: "nguyenvanan@gmail.com"');
      console.log('  Password: "123456"');
      console.log('');
      
      console.log('📥 Response received:');
      console.log('  Status:', response.status);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ Login successful (expected behavior)');
      } else if (response.status === 401) {
        console.log('  ⚠️  Authentication failed (wrong password or user not found)');
      } else if (response.status === 400) {
        console.log('  ❌ Validation error (unexpected for valid email)');
        if (response.data.errors) {
          response.data.errors.forEach((error, index) => {
            console.log(`    ${index + 1}. ${error.msg} (field: ${error.param})`);
          });
        }
      }
      console.log('');
      
    } catch (error) {
      console.error('❌ Test failed with exception:');
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('  Error:', error.message);
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('  No response received. Is the server running?');
      console.error('  URL:', error.config?.url);
    } else {
      console.error('  Error:', error.message);
    }
    process.exit(1);
  }
}

testLoginValidation().catch(console.error);

