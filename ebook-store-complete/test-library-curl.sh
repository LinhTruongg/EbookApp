#!/bin/bash

API_BASE="http://localhost:3000/api"

echo "🧪 Testing Library Functionality with curl..."

# 1. Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token (basic extraction)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from login response"
  exit 1
fi

echo "✅ Login successful, token: ${TOKEN:0:20}..."

# 2. Get books
echo -e "\n2. Getting books..."
BOOKS_RESPONSE=$(curl -s -X GET "$API_BASE/books")
echo "Books response: $BOOKS_RESPONSE"

# Extract first book ID (basic extraction)
BOOK_ID=$(echo $BOOKS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BOOK_ID" ]; then
  echo "❌ Failed to get book ID from books response"
  exit 1
fi

echo "✅ Found test book ID: $BOOK_ID"

# 3. Add book to library
echo -e "\n3. Adding book to library..."
ADD_RESPONSE=$(curl -s -X POST "$API_BASE/users/library/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookId\":\"$BOOK_ID\"}")

echo "Add to library response: $ADD_RESPONSE"

# 4. Update reading progress
echo -e "\n4. Updating reading progress..."
PROGRESS_RESPONSE=$(curl -s -X PUT "$API_BASE/users/reading-progress/$BOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"progress":25,"pageNumber":5}')

echo "Update progress response: $PROGRESS_RESPONSE"

# 5. Get categorized library
echo -e "\n5. Getting categorized library..."
LIBRARY_RESPONSE=$(curl -s -X GET "$API_BASE/users/library/categorized" \
  -H "Authorization: Bearer $TOKEN")

echo "Library response: $LIBRARY_RESPONSE"

# 6. Mark book as completed
echo -e "\n6. Marking book as completed..."
COMPLETE_RESPONSE=$(curl -s -X POST "$API_BASE/users/complete-book" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookId\":\"$BOOK_ID\"}")

echo "Mark completed response: $COMPLETE_RESPONSE"

# 7. Get updated library
echo -e "\n7. Getting updated library..."
UPDATED_LIBRARY_RESPONSE=$(curl -s -X GET "$API_BASE/users/library/categorized" \
  -H "Authorization: Bearer $TOKEN")

echo "Updated library response: $UPDATED_LIBRARY_RESPONSE"

echo -e "\n🎉 Test completed! Check the responses above for any errors."

