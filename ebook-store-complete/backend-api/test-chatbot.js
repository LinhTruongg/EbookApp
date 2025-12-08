require('dotenv').config();
const axios = require('axios');

async function testChatbot() {
  try {
    console.log('🧪 Testing Chatbot API...\n');
    
    const baseURL = process.env.API_URL || 'http://localhost:3000/api';
    
    console.log('📋 Environment check:');
    console.log('  - GEMINI_API_ENDPOINT:', process.env.GEMINI_API_ENDPOINT ? '✅ Set' : '❌ Not set');
    console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `✅ Set (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Not set');
    console.log('  - Base URL:', baseURL);
    console.log('');
    
    const testMessage = 'Tìm sách về tài chính';
    
    console.log('📤 Sending request...');
    console.log('  Message:', testMessage);
    console.log('');
    
    const response = await axios.post(
      `${baseURL}/chatbot/chat`,
      {
        message: testMessage,
        conversationHistory: []
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000
      }
    );
    
    console.log('✅ Response received:');
    console.log('  Status:', response.status);
    console.log('  Success:', response.data.success);
    if (response.data.success) {
      console.log('  AI Message:', response.data.data.message.substring(0, 100) + '...');
      console.log('  Suggested Books:', response.data.data.suggestedBooks.length);
    } else {
      console.log('  Error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('  No response received');
      console.error('  Error:', error.message);
    } else {
      console.error('  Error:', error.message);
    }
    console.error('  Stack:', error.stack);
  }
}

testChatbot();

