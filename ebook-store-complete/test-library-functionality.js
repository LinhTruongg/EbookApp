const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testLibraryFunctionality() {
  try {
    console.log('🧪 Testing Library Functionality...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // 2. Get books to find one to test with
    console.log('2. Getting books...');
    const booksResponse = await axios.get(`${API_BASE}/books`);
    
    if (!booksResponse.data.success || !booksResponse.data.data.length) {
      throw new Error('No books found');
    }

    const testBook = booksResponse.data.data[0];
    console.log(`✅ Found test book: ${testBook.title} (ID: ${testBook.id})\n`);

    // 3. Add book to library
    console.log('3. Adding book to library...');
    const addToLibraryResponse = await axios.post(`${API_BASE}/users/library/add`, {
      bookId: testBook.id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!addToLibraryResponse.data.success) {
      throw new Error('Add to library failed: ' + addToLibraryResponse.data.message);
    }

    console.log('✅ Book added to library\n');

    // 4. Update reading progress
    console.log('4. Updating reading progress...');
    const updateProgressResponse = await axios.put(`${API_BASE}/users/reading-progress/${testBook.id}`, {
      progress: 25,
      pageNumber: 5
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!updateProgressResponse.data.success) {
      throw new Error('Update progress failed: ' + updateProgressResponse.data.message);
    }

    console.log('✅ Reading progress updated to 25%\n');

    // 5. Get categorized library
    console.log('5. Getting categorized library...');
    const libraryResponse = await axios.get(`${API_BASE}/users/library/categorized`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!libraryResponse.data.success) {
      throw new Error('Get library failed: ' + libraryResponse.data.message);
    }

    const library = libraryResponse.data.data;
    console.log('✅ Library data retrieved:');
    console.log(`   - Reading: ${library.categories.reading.length} books`);
    console.log(`   - Completed: ${library.categories.completed.length} books`);
    console.log(`   - Favorited: ${library.categories.favorited.length} books`);
    console.log(`   - Total: ${library.stats.totalBooks} books\n`);

    // 6. Mark book as completed
    console.log('6. Marking book as completed...');
    const completeResponse = await axios.post(`${API_BASE}/users/complete-book`, {
      bookId: testBook.id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!completeResponse.data.success) {
      throw new Error('Mark completed failed: ' + completeResponse.data.message);
    }

    console.log('✅ Book marked as completed\n');

    // 7. Get updated library
    console.log('7. Getting updated library...');
    const updatedLibraryResponse = await axios.get(`${API_BASE}/users/library/categorized`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedLibrary = updatedLibraryResponse.data.data;
    console.log('✅ Updated library data:');
    console.log(`   - Reading: ${updatedLibrary.categories.reading.length} books`);
    console.log(`   - Completed: ${updatedLibrary.categories.completed.length} books`);
    console.log(`   - Favorited: ${updatedLibrary.categories.favorited.length} books`);
    console.log(`   - Total: ${updatedLibrary.stats.totalBooks} books\n`);

    console.log('🎉 All tests passed! Library functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testLibraryFunctionality();



