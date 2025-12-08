require('dotenv').config();
const axios = require('axios');

async function testAuthorSearch() {
  const tests = [
    'Tìm cho tôi 1 cuốn sách của tác giả Nguyen Du',
    'Nguyễn Du',
    'tac gia Nguyen Du',
    'sách của Nguyễn Du'
  ];

  for (let i = 0; i < tests.length; i++) {
    const msg = tests[i];
    try {
      console.log(`\n🧪 Test ${i + 1}: "${msg}"`);
      const response = await axios.post(
        'http://localhost:3000/api/chatbot/chat',
        { message: msg, conversationHistory: [] },
        { timeout: 30000 }
      );

      console.log('✅ Message:', response.data.data.message);
      console.log('📚 Books:', response.data.data.suggestedBooks.length, 'cuốn');
      response.data.data.suggestedBooks.forEach((b, idx) => {
        console.log(`   ${idx + 1}. ${b.title} - Authors: ${b.authors.map(a => a.name).join(', ')}`);
      });
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    
    // Đợi một chút giữa các request
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testAuthorSearch().then(() => process.exit(0)).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

