USE ebook_store;

INSERT INTO books (
    title, 
    subtitle, 
    description, 
    isbn, 
    category_id, 
    publisher, 
    publication_date, 
    page_count, 
    language, 
    cover_image, 
    is_featured, 
    is_bestseller, 
    is_new_release, 
    tags, 
    created_at, 
    updated_at
) VALUES (
    'Test Book for Library',
    'A test book to verify library functionality',
    'This is a test book created to verify that the library functionality works correctly. It contains sample content for testing purposes.',
    '978-1234567890',
    1,
    'Test Publisher',
    '2024-01-01',
    100,
    'vi',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    true,
    false,
    true,
    '["test", "library", "demo"]',
    NOW(),
    NOW()
);

INSERT INTO book_authors (book_id, author_id, role) VALUES (LAST_INSERT_ID(), 1, 'author');



