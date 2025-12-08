require('dotenv').config();
const axios = require('axios');

async function testCountAndGenre() {
  const tests = [
    { msg: 'Gioi thieu toi 2 cuon sach cho nguoi moi hoc lap trinh', expected: 2 },
    { msg: 'Tìm cho tôi 1 cuốn sách về tài chính', expected: 1 },
    { msg: 'top 3 sách hay nhất', expected: 3 },
    { msg: 'Cho toi 4 cuon sach ve tam ly', expected: 4 },
    { msg: '5 cuốn sách về lịch sử', expected: 5 }
  ];

  for (let i = 0; i < tests.length; i++) {
    const { msg, expected } = tests[i];
    try {
      console.log(`\n🧪 Test ${i + 1}: "${msg}"`);
      console.log(`   Expected: ${expected} books`);
      const response = await axios.post(
        'http://localhost:3000/api/chatbot/chat',
        { message: msg, conversationHistory: [] },
        { timeout: 30000 }
      );

      const actual = response.data.data.suggestedBooks.length;
      const status = actual === expected ? '✅' : '❌';
      console.log(`${status} Message: ${response.data.data.message}`);
      console.log(`   Actual: ${actual} books`);
      response.data.data.suggestedBooks.forEach((b, idx) => {
        console.log(`   ${idx + 1}. ${b.title} - Category: ${b.category?.name || 'N/A'}`);
      });
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testCountAndGenre().then(() => process.exit(0)).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

