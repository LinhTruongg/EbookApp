const { Book, Category, Author } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

class ChatbotController {
  async chatWithAI(req, res) {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập câu hỏi'
        });
      }

      const GEMINI_API_ENDPOINT = process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

      if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is not configured');
        return res.status(500).json({
          success: false,
          message: 'Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env'
        });
      }

      console.log('📚 Fetching available books...');
      let availableBooks = [];
      try {
        availableBooks = await Book.findAll({
          attributes: ['id', 'title', 'description', 'subtitle', 'rating', 'totalReviews', 'coverImage'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: Author,
              as: 'authors',
              attributes: ['id', 'name'],
              through: { attributes: [] },
              required: false
            }
          ],
          limit: 100
        });
        console.log(`✅ Found ${availableBooks.length} books`);
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi tải danh sách sách',
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }

      // ===== Bước 1: Gọi Gemini để phân tích ý định (intent) =====
      const intent = {
        author: null,
        genre: null,
        keywords: [],
        count: null,
        ratingFilter: null
      };

      console.log('🤖 Calling Gemini API for intent analysis...');
      try {
        const intentPrompt = `Phân tích câu hỏi sau của người dùng và TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON HỢP LỆ:\\n\\n\"${message}\"\\n\\nYêu cầu:\\n- Chỉ trả về JSON, không thêm giải thích, không thêm text bên ngoài.\\n- Cấu trúc JSON:\\n{\\n  \"author\": string | null,\\n  \"genre\": string | null,\\n  \"keywords\": string[],\\n  \"count\": number | null,\\n  \"ratingFilter\": string | null\\n}\\nGiải thích:\\n- \"author\": Tên tác giả nếu người dùng nhắc tới (ví dụ: \"Nguyễn Du\"), nếu không có thì null.\\n- \"genre\": Thể loại chính nếu có (ví dụ: \"tài chính\", \"tâm lý\"), nếu không có thì null.\\n- \"keywords\": 2-5 từ khóa quan trọng liên quan tới yêu cầu.\\n- \"count\": Số sách người dùng muốn (ví dụ: 1 nếu họ nói \"1 cuốn\" hoặc \"một quyển\"; nếu không nói rõ, dùng 3).\\n- \"ratingFilter\": \"lowest\" nếu yêu cầu sách đánh giá thấp nhất, \"highest\" nếu yêu cầu sách đánh giá cao nhất, \"above_X\" nếu yêu cầu trên X sao (ví dụ: \"above_4\"), null nếu không có yêu cầu về rating.`;

        const intentResponse = await axios.post(
          `${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: intentPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 256,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 20000
          }
        );

        const intentText = intentResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('✅ Gemini intent raw response:', intentText);

        try {
          const parsed = JSON.parse(intentText);
          if (parsed && typeof parsed === 'object') {
            if (parsed.author && typeof parsed.author === 'string') {
              intent.author = parsed.author.trim() || null;
            }
            if (parsed.genre && typeof parsed.genre === 'string') {
              intent.genre = parsed.genre.trim() || null;
            }
            if (Array.isArray(parsed.keywords)) {
              intent.keywords = parsed.keywords
                .filter(k => typeof k === 'string')
                .map(k => this.normalizeText(k.trim()))
                .filter(k => k.length > 0);
            }
            if (typeof parsed.count === 'number' && Number.isFinite(parsed.count)) {
              intent.count = parsed.count;
            }
            if (parsed.ratingFilter && typeof parsed.ratingFilter === 'string') {
              intent.ratingFilter = parsed.ratingFilter.trim() || null;
            }
          }
        } catch (jsonError) {
          console.warn('⚠️ Gemini intent JSON parse error:', jsonError.message);
        }
      } catch (geminiError) {
        console.error('❌ Gemini intent API error:', geminiError.response?.data || geminiError.message);
      }

      // Fallback: Tự động detect rating filter từ message (ưu tiên trước khi extract author)
      if (!intent.ratingFilter) {
        const normalizedMsg = this.normalizeText(message);
        const aboveMatch = message.match(/(?:trên|tren|above|từ|tu)\s*(\d+(?:\.\d+)?)\s*(?:sao|star|điểm|diem)/i);
        if (aboveMatch) {
          intent.ratingFilter = `above_${aboveMatch[1]}`;
          console.log(`🔍 Detected rating filter: above ${aboveMatch[1]}`);
        } else if (normalizedMsg.includes('danh gia thap') || normalizedMsg.includes('rating thap') || 
                   normalizedMsg.includes('thap nhat') || normalizedMsg.includes('thấp nhất')) {
          intent.ratingFilter = 'lowest';
          console.log('🔍 Detected rating filter: lowest');
        } else if (normalizedMsg.includes('danh gia cao') || normalizedMsg.includes('rating cao') ||
                   normalizedMsg.includes('cao nhat') || normalizedMsg.includes('cao nhất') ||
                   (normalizedMsg.includes('top') && normalizedMsg.includes('sach')) ||
                   normalizedMsg.includes('hay nhat') || normalizedMsg.includes('hay nhất')) {
          intent.ratingFilter = 'highest';
          console.log('🔍 Detected rating filter: highest');
        }
      }

      // Fallback: Tự động extract author từ message nếu Gemini không parse được
      // Chỉ extract nếu không có rating filter (tránh nhầm lẫn)
      if (!intent.author && !intent.ratingFilter) {
        const stopWords = ['sach', 'sách', 'cuon', 'cuốn', 'quyen', 'quyển', 'cua', 'của', 'tac', 'tác', 'gia', 'giả', 'cho', 'toi', 'tôi', 'mot', 'một', 'tim', 'tìm', 'sach', 'sách'];
        
        // Pattern 1: "tác giả X" hoặc "tac gia X" - lấy đến khi gặp stop word hoặc số
        const pattern1 = /(?:tác\s+giả|tac\s+gia|author)\s+([A-Za-zÀ-ỹ\s]+?)(?=\s*(?:1|2|3|4|5|6|7|8|9|0|mot|một|hai|ba|cuon|cuốn|quyen|quyển|sach|sách|$|,|\.))/i;
        let match = message.match(pattern1);
        if (match && match[1]) {
          let extracted = match[1].trim();
          // Tách từ và loại bỏ stop words, nhưng giữ lại tất cả từ hợp lệ
          const words = extracted.split(/\s+/).filter(w => {
            const normalized = this.normalizeText(w);
            return !stopWords.includes(normalized) && w.length > 0 && !/^\d+$/.test(w);
          });
          if (words.length > 0) {
            intent.author = words.join(' ').trim();
            console.log(`🔍 Extracted author (pattern1): "${intent.author}"`);
          }
        }
        
        // Pattern 2: "của X" hoặc "cu X" (nếu chưa có)
        if (!intent.author) {
          const pattern2 = /(?:của|cu|bởi|boi)\s+([A-Za-zÀ-ỹ\s]+?)(?=\s*(?:1|2|3|4|5|6|7|8|9|0|mot|một|hai|ba|cuon|cuốn|quyen|quyển|sach|sách|$|,|\.))/i;
          match = message.match(pattern2);
          if (match && match[1]) {
            let extracted = match[1].trim();
            const words = extracted.split(/\s+/).filter(w => {
              const normalized = this.normalizeText(w);
              return !stopWords.includes(normalized) && w.length > 0 && !/^\d+$/.test(w);
            });
            if (words.length > 0) {
              intent.author = words.join(' ').trim();
              console.log(`🔍 Extracted author (pattern2): "${intent.author}"`);
            }
          }
        }
        
        // Pattern 3: Nếu message ngắn và có vẻ là tên tác giả trực tiếp (2-4 từ)
        if (!intent.author && message.split(/\s+/).length <= 4) {
          const words = message.split(/\s+/).filter(w => {
            const normalized = this.normalizeText(w);
            return !stopWords.includes(normalized) && w.length > 1 && !/^\d+$/.test(w);
          });
          if (words.length >= 1 && words.length <= 4) {
            intent.author = words.join(' ').trim();
            console.log(`🔍 Extracted author (direct name): "${intent.author}"`);
          }
        }
      }

      console.log('📋 Final intent:', JSON.stringify(intent, null, 2));

      // ===== Bước 2: Từ khóa & số lượng dựa trên intent + fallback local =====
      console.log('🔍 Extracting search keywords...');
      let searchKeywords = Array.isArray(intent.keywords) && intent.keywords.length > 0
        ? intent.keywords
        : this.extractSearchKeywords(message);

      if (!searchKeywords || searchKeywords.length === 0) {
        searchKeywords = this.extractSearchKeywords(message);
      }
      
      // Thêm genre vào keywords nếu có để tìm kiếm tốt hơn
      if (intent.genre && !searchKeywords.includes(intent.genre)) {
        searchKeywords.push(this.normalizeText(intent.genre));
      }
      
      // Fallback: Nếu có rating filter nhưng chưa có genre, thử extract genre từ keywords hoặc message
      if (intent.ratingFilter && !intent.genre) {
        const genreKeywords = ['lap trinh', 'programming', 'tai chinh', 'tam ly', 'lich su', 'tieu thuyet', 'kinh doanh', 'khoi nghiep', 'van hoc'];
        const genreMap = {
          'lap trinh': 'lập trình',
          'programming': 'lập trình',
          'tai chinh': 'tài chính',
          'tam ly': 'tâm lý',
          'lich su': 'lịch sử',
          'tieu thuyet': 'tiểu thuyết',
          'kinh doanh': 'kinh doanh',
          'khoi nghiep': 'khởi nghiệp',
          'van hoc': 'văn học'
        };
        
        // Thử extract từ keywords trước
        if (searchKeywords.length > 0) {
          for (const keyword of searchKeywords) {
            const normalizedKeyword = this.normalizeText(keyword);
            for (const genreKey of genreKeywords) {
              if (normalizedKeyword.includes(genreKey) || genreKey.includes(normalizedKeyword)) {
                intent.genre = genreMap[genreKey] || keyword;
                console.log(`🔍 Extracted genre from keywords: "${intent.genre}"`);
                break;
              }
            }
            if (intent.genre) break;
          }
        }
        
        // Nếu vẫn chưa có, thử extract trực tiếp từ message
        if (!intent.genre) {
          const normalizedMsg = this.normalizeText(message);
          for (const genreKey of genreKeywords) {
            if (normalizedMsg.includes(genreKey)) {
              intent.genre = genreMap[genreKey] || genreKey;
              console.log(`🔍 Extracted genre from message: "${intent.genre}"`);
              break;
            }
          }
        }
      }

      let targetCount = 3;
      if (typeof intent.count === 'number' && intent.count > 0 && intent.count <= 10) {
        targetCount = Math.round(intent.count);
        console.log(`📊 Using count from intent: ${targetCount}`);
      } else {
        // Normalize message để tìm số lượng (có dấu và không dấu)
        const normalizedMsg = this.normalizeText(message);
        const numberPattern = /(\d+)\s*(?:cuon|cuốn|quyen|quyển|sach|sách)/i;
        const match = message.match(numberPattern);
        if (match && match[1]) {
          const num = parseInt(match[1]);
          if (num > 0 && num <= 10) {
            targetCount = num;
            console.log(`📊 Extracted count from message: ${targetCount}`);
          }
        } else {
          // Fallback: tìm số bằng chữ
          if (normalizedMsg.includes('mot cuon') || normalizedMsg.includes('mot quyen') || normalizedMsg.includes('1 cuon')) {
            targetCount = 1;
          } else if (normalizedMsg.includes('hai cuon') || normalizedMsg.includes('2 cuon')) {
            targetCount = 2;
          } else if (normalizedMsg.includes('ba cuon') || normalizedMsg.includes('3 cuon')) {
            targetCount = 3;
          } else if (normalizedMsg.includes('bon cuon') || normalizedMsg.includes('4 cuon')) {
            targetCount = 4;
          } else if (normalizedMsg.includes('nam cuon') || normalizedMsg.includes('5 cuon')) {
            targetCount = 5;
          }
        }
      }
      
      // Giới hạn tối đa 5 cuốn
      if (targetCount > 5) {
        targetCount = 5;
      }
      
      console.log(`📊 Final targetCount: ${targetCount}`);

      console.log('📖 Finding matching books...');

      let booksForScoring = availableBooks;
      let usedAuthorFilter = false;
      let usedGenreFilter = false;

      // Filter theo genre/category nếu có
      if (intent.genre) {
        const genreQuery = this.normalizeText(intent.genre);
        console.log(`🔍 Searching for genre: "${intent.genre}" (normalized: "${genreQuery}")`);
        
        if (genreQuery.length > 0) {
          // Mapping từ genre keywords sang category names (có dấu và không dấu)
          // CHỈ map các category thực sự liên quan, tránh map quá rộng
          const genreMappings = {
            'lap trinh': ['Lập trình', 'Programming', 'Công nghệ thông tin'],
            'programming': ['Lập trình', 'Programming', 'Công nghệ thông tin'],
            'cong nghe': ['Công nghệ', 'Công nghệ thông tin', 'Lập trình'],
            'tai chinh': ['Tài chính', 'Finance', 'Đầu tư'],
            'dau tu': ['Đầu tư', 'Tài chính', 'Finance'],
            'tam ly': ['Tâm lý', 'Tâm lý học', 'Psychology'],
            'tam ly hoc': ['Tâm lý học', 'Tâm lý', 'Psychology'],
            'lich su': ['Lịch sử', 'History'],
            'tieu thuyet': ['Tiểu thuyết', 'Fiction', 'Văn học'],
            'khoi nghiep': ['Khởi nghiệp', 'Business'],
            'kinh doanh': ['Kinh doanh', 'Business', 'Khởi nghiệp'],
            'van hoc': ['Văn học', 'Literature', 'Tiểu thuyết']
          };
          
          // Tìm mapping phù hợp (match chính xác hoặc một phần)
          let possibleCategories = [];
          for (const [key, categories] of Object.entries(genreMappings)) {
            if (genreQuery === key || genreQuery.includes(key) || key.includes(genreQuery)) {
              possibleCategories = categories;
              console.log(`✅ Matched genre "${genreQuery}" to categories: ${categories.join(', ')}`);
              break;
            }
          }
          
          // Nếu không tìm thấy mapping, dùng genreQuery trực tiếp
          if (possibleCategories.length === 0) {
            possibleCategories = [genreQuery];
            console.log(`⚠️ No mapping found for "${genreQuery}", using direct match`);
          }
          
          const byGenre = availableBooks.filter(book => {
            const categoryName = book.category?.name || '';
            if (!categoryName) return false; // Bỏ qua sách không có category
            
            const normalizedCategory = this.normalizeText(categoryName);
            
            // CHỈ kiểm tra category name trực tiếp - không dùng description/title để tránh match sai
            const categoryMatch = possibleCategories.some(cat => {
              const normalizedCat = this.normalizeText(cat);
              return normalizedCategory === normalizedCat || 
                     normalizedCategory.includes(normalizedCat) || 
                     normalizedCat.includes(normalizedCategory);
            });
            
            return categoryMatch;
          });

          if (byGenre.length > 0) {
            console.log(`📚 Found ${byGenre.length} books matching genre "${intent.genre}"`);
            booksForScoring = byGenre;
            usedGenreFilter = true;
          } else {
            console.log(`ℹ️ No books found for genre "${intent.genre}"`);
            // Nếu user yêu cầu rõ ràng về genre (có từ "về", "thể loại") và không tìm được
            const hasGenreKeyword = /về|ve|thể loại|the loai|genre|category/i.test(message);
            if (hasGenreKeyword) {
              return res.json({
                success: true,
                data: {
                  message: `Hiện thư viện chưa có sách về thể loại ${intent.genre}.`,
                  suggestedBooks: [],
                  searchKeywords: searchKeywords
                }
              });
            }
            // Nếu không có từ khóa rõ ràng về genre, vẫn tìm kiếm theo keywords
            console.log(`   Will search by keywords instead`);
          }
        }
      }

      if (intent.author) {
        const authorQuery = this.normalizeText(intent.author);
        console.log(`🔍 Searching for author: "${intent.author}" (normalized: "${authorQuery}")`);
        
        if (authorQuery.length > 0) {
          const byAuthor = availableBooks.filter(book => {
            if (!book.authors || !Array.isArray(book.authors)) return false;
            
            // Kiểm tra từng tác giả
            for (const author of book.authors) {
              const normalizedAuthorName = this.normalizeText(author.name || '');
              // So sánh chính xác hoặc contains
              if (normalizedAuthorName === authorQuery || 
                  normalizedAuthorName.includes(authorQuery) || 
                  authorQuery.includes(normalizedAuthorName)) {
                return true;
              }
            }
            return false;
          });

          console.log(`📚 Found ${byAuthor.length} books matching author "${intent.author}"`);
          if (byAuthor.length > 0) {
            console.log(`✅ Books found:`, byAuthor.map(b => ({
              title: b.title,
              authors: b.authors?.map(a => a.name).join(', ')
            })));
            booksForScoring = byAuthor;
            usedAuthorFilter = true;
          } else {
            console.log(`ℹ️ No books found for author "${intent.author}", returning empty suggestions`);
            return res.json({
              success: true,
              data: {
                message: `Hiện thư viện chưa có sách của tác giả ${intent.author}.`,
                suggestedBooks: [],
                searchKeywords
              }
            });
          }
        }
      }

      let suggestedBooks = [];

      // Nếu yêu cầu về rating (thấp nhất/cao nhất), ưu tiên sắp xếp theo rating
      if (intent.ratingFilter === 'lowest' || intent.ratingFilter === 'highest') {
        console.log(`📊 Applying rating filter: ${intent.ratingFilter}`);

        // Chuyển về format response và LOẠI sách chưa có rating (rating <= 0)
        let booksToSort = booksForScoring
          .map(book => this.formatBookForResponse(book))
          .filter(book => typeof book.rating === 'number' && book.rating > 0);

        // Sắp xếp theo rating
        if (intent.ratingFilter === 'lowest') {
          booksToSort = booksToSort.sort((a, b) => a.rating - b.rating);
        } else {
          booksToSort = booksToSort.sort((a, b) => b.rating - a.rating);
        }

        // Nếu sau khi bỏ sách rating = 0 mà không còn sách nào, fallback lại toàn bộ
        // NHƯNG vẫn chỉ lấy từ booksForScoring (đã filter theo genre nếu có)
        if (booksToSort.length === 0) {
          booksToSort = booksForScoring
            .map(book => this.formatBookForResponse(book))
            .sort((a, b) =>
              intent.ratingFilter === 'lowest'
                ? (a.rating || 0) - (b.rating || 0)
                : (b.rating || 0) - (a.rating || 0)
            );
        }
        
        // QUAN TRỌNG: Đảm bảo không vượt quá số sách có trong thể loại
        // Đây là kiểm tra cuối cùng để đảm bảo không bao giờ lấy thêm sách từ ngoài thể loại
        const maxAvailable = booksForScoring.length;
        const actualCount = Math.min(booksToSort.length, targetCount, maxAvailable);
        booksToSort = booksToSort.slice(0, actualCount);
        
        if (usedGenreFilter && booksToSort.length < targetCount) {
          console.log(`⚠️ Only found ${booksToSort.length} books in genre "${intent.genre}", requested ${targetCount}. Will return only available books.`);
        }

        suggestedBooks = booksToSort;
      } else {
        // Logic tìm kiếm thông thường theo keywords
        suggestedBooks = await this.findMatchingBooks(searchKeywords, booksForScoring);

        if (!suggestedBooks || suggestedBooks.length === 0) {
          console.log('ℹ️ No books matched keywords scoring, using fallback list');
          // QUAN TRỌNG: Chỉ lấy từ booksForScoring (đã được filter theo genre nếu có)
          // Không bao giờ lấy từ availableBooks để tránh lấy sách ngoài thể loại
          suggestedBooks = booksForScoring
            .slice(0, targetCount)
            .map(book => this.formatBookForResponse(book));
        } else {
          // Đảm bảo chỉ lấy đúng số lượng yêu cầu, nhưng không vượt quá số sách có trong thể loại
          const maxAvailable = booksForScoring.length;
          const actualCount = Math.min(suggestedBooks.length, targetCount, maxAvailable);
          suggestedBooks = suggestedBooks.slice(0, actualCount);
          
          // Nếu đã filter theo genre và không đủ số lượng, chỉ trả về số có
          if (usedGenreFilter && suggestedBooks.length < targetCount) {
            console.log(`⚠️ Only found ${suggestedBooks.length} books in genre "${intent.genre}", requested ${targetCount}`);
          }
        }
        
        // Đảm bảo số lượng chính xác (không vượt quá số sách có)
        const maxAvailable = booksForScoring.length;
        if (suggestedBooks.length > maxAvailable) {
          suggestedBooks = suggestedBooks.slice(0, maxAvailable);
        }
        if (suggestedBooks.length > targetCount) {
          suggestedBooks = suggestedBooks.slice(0, targetCount);
        }

        // Áp dụng rating filter nếu có (above_X)
        if (intent.ratingFilter && intent.ratingFilter.startsWith('above_')) {
          const minRating = parseFloat(intent.ratingFilter.replace('above_', ''));
          suggestedBooks = suggestedBooks
            .filter(book => (book.rating || 0) >= minRating)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));
          
          // Sau khi filter rating, vẫn không được vượt quá số sách có trong thể loại
          const maxAvailable = booksForScoring.length;
          const actualCount = Math.min(suggestedBooks.length, targetCount, maxAvailable);
          suggestedBooks = suggestedBooks.slice(0, actualCount);
          console.log(`📊 Filtered by rating >= ${minRating}, found ${suggestedBooks.length} books`);
        }
      }

      // KIỂM TRA CUỐI CÙNG: Đảm bảo không bao giờ vượt quá số sách có trong thể loại
      // Nếu đã filter theo genre, chỉ trả về số sách có trong thể loại đó
      if (usedGenreFilter && suggestedBooks.length > booksForScoring.length) {
        console.log(`⚠️ WARNING: suggestedBooks (${suggestedBooks.length}) > booksForScoring (${booksForScoring.length}). Trimming to available books.`);
        suggestedBooks = suggestedBooks.slice(0, booksForScoring.length);
      }
      
      // Đảm bảo không vượt quá targetCount
      if (suggestedBooks.length > targetCount) {
        suggestedBooks = suggestedBooks.slice(0, targetCount);
      }

      console.log(`✅ Chatbot response ready with ${suggestedBooks.length} suggested books`);

      let aiResponse = '';
      const actualCount = suggestedBooks.length;
      
      if (intent.ratingFilter === 'lowest') {
        if (actualCount === 1) {
          aiResponse = `Tôi tìm được 1 cuốn sách có đánh giá thấp nhất phù hợp với yêu cầu của bạn.`;
        } else {
          aiResponse = `Tôi tìm được ${actualCount} cuốn sách có đánh giá thấp nhất phù hợp với yêu cầu của bạn.`;
        }
      } else if (intent.ratingFilter === 'highest') {
        if (actualCount === 1) {
          aiResponse = `Tôi tìm được 1 cuốn sách có đánh giá cao nhất phù hợp với yêu cầu của bạn.`;
        } else {
          aiResponse = `Tôi tìm được ${actualCount} cuốn sách có đánh giá cao nhất phù hợp với yêu cầu của bạn.`;
        }
      } else if (intent.ratingFilter && intent.ratingFilter.startsWith('above_')) {
        const minRating = intent.ratingFilter.replace('above_', '');
        aiResponse = `Tôi tìm được ${actualCount} cuốn sách có đánh giá từ ${minRating} sao trở lên phù hợp với yêu cầu của bạn.`;
      } else if (usedAuthorFilter && intent.author) {
        if (actualCount === 1) {
          aiResponse = `Tôi tìm được 1 cuốn sách của tác giả ${intent.author} phù hợp với yêu cầu của bạn.`;
        } else {
          aiResponse = `Tôi tìm được ${actualCount} cuốn sách của tác giả ${intent.author} phù hợp với yêu cầu của bạn.`;
        }
      } else if (usedGenreFilter && intent.genre) {
        if (actualCount === 1) {
          aiResponse = `Tôi tìm được 1 cuốn sách về ${intent.genre} phù hợp với yêu cầu của bạn.`;
        } else {
          aiResponse = `Tôi tìm được ${actualCount} cuốn sách về ${intent.genre} phù hợp với yêu cầu của bạn.`;
        }
      } else {
        if (actualCount === 1) {
          aiResponse = 'Tôi tìm được 1 cuốn sách phù hợp với yêu cầu của bạn.';
        } else {
          aiResponse = `Tôi tìm được ${actualCount} cuốn sách phù hợp với yêu cầu của bạn.`;
        }
      }

      res.json({
        success: true,
        data: {
          message: aiResponse,
          suggestedBooks,
          searchKeywords
        }
      });

    } catch (error) {
      console.error('❌ Chatbot error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý câu hỏi. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  extractSearchKeywords(message) {
    const keywords = [];
    const normalizedMessage = this.normalizeText(message);
    
    const commonBookTerms = ['sach', 'cuon', 'tac gia', 'the loai', 'de xuat', 'goi y'];
    const stopWords = ['toi', 'muon', 'can', 'tim', 'kiem', 've', 'cho', 'cua', 'va', 'hoac'];
    
    const words = normalizedMessage
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word) && !commonBookTerms.includes(word));
    
    keywords.push(...words);
    
    return [...new Set(keywords)].filter(k => k.length > 0);
  }

  async findMatchingBooks(keywords, availableBooks) {
    if (!availableBooks || availableBooks.length === 0) {
      return [];
    }

    if (keywords.length === 0) {
      return availableBooks.slice(0, 5).map(book => this.formatBookForResponse(book));
    }

    const normalizedKeywords = keywords.map(k => this.normalizeText(k));
    
    const scoredBooks = availableBooks.map(book => {
      let score = 0;
      const authorsText = book.authors && Array.isArray(book.authors) 
        ? book.authors.map(a => a.name || '').join(' ') 
        : '';
      const categoryName = book.category?.name || '';
      const bookTextRaw = `${book.title || ''} ${book.description || ''} ${book.subtitle || ''} ${categoryName} ${authorsText}`;
      const normalizedBookText = this.normalizeText(bookTextRaw);
      const normalizedTitle = this.normalizeText(book.title || '');
      const normalizedDescription = this.normalizeText(book.description || '');
      const normalizedCategory = this.normalizeText(categoryName);

      normalizedKeywords.forEach(keyword => {
        if (normalizedBookText.includes(keyword)) {
          // Ưu tiên category cao nhất (20 điểm) - quan trọng cho genre matching
          if (normalizedCategory.includes(keyword)) {
            score += 20;
          }
          // Ưu tiên title (15 điểm)
          else if (normalizedTitle.includes(keyword)) {
            score += 15;
          } 
          // Description (5 điểm)
          else if (normalizedDescription.includes(keyword)) {
            score += 5;
          } 
          // Match trong authors hoặc subtitle (2 điểm)
          else {
            score += 2;
          }
        }
      });
      
      // Bonus điểm nếu nhiều keywords match
      const matchedKeywords = normalizedKeywords.filter(k => normalizedBookText.includes(k)).length;
      if (matchedKeywords > 1) {
        score += matchedKeywords * 3;
      }
      
      // Bonus lớn nếu category match với keyword chính (để ưu tiên sách đúng thể loại)
      if (normalizedKeywords.length > 0) {
        const mainKeyword = normalizedKeywords[0];
        if (normalizedCategory.includes(mainKeyword) || mainKeyword.includes(normalizedCategory)) {
          score += 25;
        }
      }

      if (book.rating) {
        score += book.rating * 0.5;
      }

      return { book, score };
    });

    return scoredBooks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => this.formatBookForResponse(item.book));
  }

  formatBookForResponse(book) {
    return {
      id: book.id,
      title: book.title || 'Không có tiêu đề',
      description: book.description || null,
      subtitle: book.subtitle || null,
      coverImage: book.coverImage || null,
      rating: book.rating ? parseFloat(book.rating) : 0,
      totalReviews: book.totalReviews ? parseInt(book.totalReviews) : 0,
      category: book.category ? {
        id: book.category.id,
        name: book.category.name
      } : null,
      authors: book.authors && Array.isArray(book.authors) 
        ? book.authors.map(author => ({
            id: author.id,
            name: author.name || 'Unknown'
          }))
        : []
    };
  }

  normalizeText(text) {
    if (!text) return '';
    try {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      return text.toString().toLowerCase();
    }
  }
}

module.exports = new ChatbotController();

