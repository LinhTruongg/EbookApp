require('dotenv').config();
const axios = require('axios');

async function testRatingFilter() {
  const tests = [
    'Cho toi top 3 cuon sach co danh gia thap nhat',
    'top 3 sách có đánh giá cao nhất',
    'sách trên 4 sao',
    'sách hay nhất'
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
        console.log(`   ${idx + 1}. ${b.title} - Rating: ${b.rating}`);
      });
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testRatingFilter().then(() => process.exit(0)).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

