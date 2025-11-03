const axios = require('axios');

async function createTestBook() {
  try {
    console.log('📚 Creating test book...');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ebookstore.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Create a test book
    const bookData = {
      title: 'Test Book for Library',
      subtitle: 'A test book to verify library functionality',
      description: 'This is a test book created to verify that the library functionality works correctly.',
      isbn: '978-1234567890',
      categoryId: 1, // Văn học
      publisher: 'Test Publisher',
      publicationDate: '2024-01-01',
      pageCount: 100,
      language: 'vi',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      isFeatured: true,
      isBestseller: false,
      isNewRelease: true,
      tags: ['test', 'library', 'demo'],
      authors: [1] // Nguyễn Du
    };

    const bookResponse = await axios.post('http://localhost:3000/api/books/admin', bookData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!bookResponse.data.success) {
      throw new Error('Book creation failed: ' + bookResponse.data.message);
    }

    console.log('✅ Test book created successfully');
    console.log('Book ID:', bookResponse.data.data.id);
    console.log('Book title:', bookResponse.data.data.title);

    return bookResponse.data.data;

  } catch (error) {
    console.error('❌ Error creating test book:', error.response?.data || error.message);
    throw error;
  }
}

createTestBook();

