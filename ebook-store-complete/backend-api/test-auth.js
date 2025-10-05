const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  password: 'Test123456',
  phone: '0123456789',
  dateOfBirth: '1995-01-01',
  gender: 'male'
};

async function testAuthentication() {
  console.log('🧪 Testing Authentication API...\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // 2. Test Register
    console.log('2️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration Success:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, continuing with login...');
      } else {
        console.log('❌ Registration Error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // 3. Test Login
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Success:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      hasToken: !!loginResponse.data.data?.token,
      hasUser: !!loginResponse.data.data?.user
    });
    
    const token = loginResponse.data.data?.token;
    console.log('');

    // 4. Test Get Profile (with token)
    if (token) {
      console.log('4️⃣ Testing Get Profile...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile Success:', {
        success: profileResponse.data.success,
        user: {
          id: profileResponse.data.data?.id,
          name: `${profileResponse.data.data?.firstName} ${profileResponse.data.data?.lastName}`,
          email: profileResponse.data.data?.email,
          role: profileResponse.data.data?.role
        }
      });
      console.log('');
    }

    // 5. Test Swagger Documentation
    console.log('5️⃣ Testing Swagger Documentation...');
    try {
      const swaggerResponse = await axios.get('http://localhost:3000/api-docs/');
      console.log('✅ Swagger UI accessible');
    } catch (error) {
      console.log('❌ Swagger Error:', error.response?.status || error.message);
    }
    console.log('');

    console.log('🎉 Authentication API Test Completed!');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthentication();
