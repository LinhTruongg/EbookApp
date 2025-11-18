const axios = require('axios');

async function testActivitiesAPI() {
  try {
    console.log('🧪 Testing Admin Activities API...\n');
    
    const baseURL = process.env.API_URL || 'http://localhost:3000/api';
    const testToken = process.env.TEST_TOKEN || '';
    
    if (!testToken) {
      console.log('⚠️  No TEST_TOKEN provided. Please set TEST_TOKEN environment variable.');
      console.log('   You can get a token by logging in as admin first.\n');
      return;
    }
    
    const response = await axios.get(`${baseURL}/admin/dashboard/activities?limit=20`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ Activities count:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 First activity sample:');
      console.log(JSON.stringify(response.data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testActivitiesAPI();

