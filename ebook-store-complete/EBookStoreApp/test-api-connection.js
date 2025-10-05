#!/usr/bin/env node

/**
 * Quick API Connection Test Script
 * Tests if Frontend can connect to Backend APIs
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const testApiConnection = async () => {
  console.log('🔗 Testing API Connection...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }

  // Test 2: Login API
  try {
    console.log('\n2️⃣ Testing Login API...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nguyenvanan@gmail.com',
      password: '123456'
    });
    console.log('✅ Login Success:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      userEmail: loginResponse.data.data.user.email,
      hasToken: !!loginResponse.data.data.token
    });
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data || error.message);
  }

  // Test 3: Forgot Password API
  try {
    console.log('\n3️⃣ Testing Forgot Password API...');
    const forgotResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: 'nguyenvanan@gmail.com'
    });
    console.log('✅ Forgot Password Success:', forgotResponse.data);
  } catch (error) {
    console.log('❌ Forgot Password Failed:', error.response?.data || error.message);
  }

  console.log('\n🎉 API Connection Test Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Start your React Native app');
  console.log('   2. Test login with: nguyenvanan@gmail.com / 123456');
  console.log('   3. Test forgot password flow');
};

testApiConnection().catch(console.error);
