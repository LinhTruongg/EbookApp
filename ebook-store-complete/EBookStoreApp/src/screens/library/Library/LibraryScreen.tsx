import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants';
import { apiService } from '../../../services/api';
import { Book } from '../../../types';
import { eventBus } from '../../../utils/eventBus';

const LibraryScreen: React.FC = () => {
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get('window');
  const H_PADDING = 20; // matches booksContainer paddingHorizontal
  const ITEM_GAP = 16; // visual gap between two columns
  const ITEM_WIDTH = (screenWidth - H_PADDING * 2 - ITEM_GAP) / 2;
  const [activeTab, setActiveTab] = useState<'reading' | 'favorited' | 'completed'>('reading');
  const [books, setBooks] = useState<{
    reading: Book[];
    favorited: Book[];
    completed: Book[];
  }>({
    reading: [],
    favorited: [],
    completed: []
  });
  const [statistics, setStatistics] = useState({
    totalBooks: 0,
    reading: 0,
    favorited: 0,
    completed: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const tabs = [
    { key: 'reading', label: 'Đang đọc' },
    { key: 'favorited', label: 'Yêu thích' },
    { key: 'completed', label: 'Đã đọc' },
  ];

  // Load library data from API
  useEffect(() => {
    loadLibraryData();
    const off = eventBus.on('wishlist:toggle', ({ book, inWishlist }: any) => {
      setBooks(prev => {
        const map: Record<string, Book> = {};
        prev.favorited.forEach(b => { map[b.id] = b; });
        if (inWishlist) {
          map[book.id] = book;
        } else {
          delete map[book.id];
        }
        const favorited = Object.values(map) as Book[];
        return { ...prev, favorited };
      });
      setStatistics(prev => ({ ...prev, favorited: (prev.favorited || 0) + (inWishlist ? 1 : -1) }));
    });
    return () => { off && off(); };
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const [libRes, wishRes] = await Promise.all([
        apiService.getUserLibraryCategorized(),
        apiService.getUserWishlist().catch(() => ({ success: false }))
      ]);

      if (libRes.success && libRes.data) {
        const reading = libRes.data.categories.reading.map((item: any) => item.book) || [];
        const completed = libRes.data.categories.completed.map((item: any) => item.book) || [];
        const favoritedFromLib = libRes.data.categories.favorited.map((item: any) => item.book) || [];

        const wishlistBooks = wishRes.success && (wishRes as any).data?.wishlist
          ? (wishRes as any).data.wishlist.map((w: any) => w.book)
          : [];

        // Union by id for favorited
        const favoritedMap: Record<string, any> = {};
        [...favoritedFromLib, ...wishlistBooks].forEach((b: any) => { favoritedMap[b.id] = b; });
        const favorited = Object.values(favoritedMap) as Book[];

        setBooks({ reading, favorited, completed });
        setStatistics(libRes.data.statistics || {
          totalBooks: 0,
          reading: reading.length,
          favorited: favorited.length,
          completed: completed.length,
          unread: 0,
        });
      } else {
        Alert.alert('Lỗi', (libRes as any).message || 'Không thể tải thư viện');
      }
    } catch (error) {
      console.error('Error loading library:', error);
      Alert.alert('Lỗi', 'Không thể tải thư viện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBooks = () => {
    const currentBooks = (() => {
      switch (activeTab) {
        case 'reading':
          return books.reading;
        case 'favorited':
          return books.favorited;
        case 'completed':
          return books.completed;
        default:
          return [];
      }
    })();

    // If searching, return filtered results
    if (searchQuery.trim()) {
      return currentBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.authors && book.authors.some(author => 
          author.name.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (book.categories && book.categories.some(category => 
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    return currentBooks;
  };

  const getAllBooks = () => {
    return [...books.reading, ...books.favorited, ...books.completed];
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const allBooks = getAllBooks();
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        (book.authors && book.authors.some(author => 
          author.name.toLowerCase().includes(query.toLowerCase())
        )) ||
        (book.categories && book.categories.some(category => 
          category.name.toLowerCase().includes(query.toLowerCase())
        ))
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
    }
  };

  const openSearchModal = () => {
    setIsSearchModalVisible(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalVisible(false);
    setSearchQuery('');
    setFilteredBooks([]);
  };

  const handleBookPress = (book: Book) => {
    router.push(`/book-reader/${book.id}` as any);
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={[styles.bookItem, { width: ITEM_WIDTH }]}
      onPress={() => handleBookPress(item)}
    >
      <Image source={{ uri: item.coverImage || 'https://via.placeholder.com/150x200' }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.authors && item.authors?.length > 0 ? item.authors[0].name : 'Unknown Author'}
        </Text>
        {/* Show reading progress for books in reading tab */}
        {activeTab === 'reading' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.progressText}>0%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✏️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư viện</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thư viện...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>✏️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư viện</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={openSearchModal}>
          <Text style={styles.headerIconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {searchQuery?.trim() && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm trong thư viện..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Books List */}
      <View style={styles.booksContainer}>
        {getCurrentBooks()?.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'reading' ? 'Chưa có sách nào đang đọc' :
               activeTab === 'favorited' ? 'Chưa có sách nào yêu thích' :
               activeTab === 'completed' ? 'Chưa có sách nào đã đọc' :
               'Chưa có sách nào'}
            </Text>
          </View>
        )}
        {getCurrentBooks()?.length > 0 ? (
          <FlatList
            data={getCurrentBooks()}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.booksList}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'reading' ? 'Chưa có sách nào đang đọc' :
               activeTab === 'favorited' ? 'Chưa có sách nào yêu thích' :
               activeTab === 'completed' ? 'Chưa có sách nào đã đọc' :
               'Chưa có sách nào'}
            </Text>
          </View>
        )}
      </View>

      {/* Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSearchModal}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchModalHeader}>
            <TextInput
              style={styles.searchModalInput}
              placeholder="Tìm kiếm trong tất cả sách..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
            />
            <TouchableOpacity onPress={closeSearchModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.searchResults}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptySearchContainer}>
                <Text style={styles.emptySearchText}>
                  {searchQuery.trim() ? 'Không tìm thấy sách nào' : 'Nhập từ khóa để tìm kiếm'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  headerIconText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  booksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  booksList: {
    paddingVertical: 20,
  },
  bookItem: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray50,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  clearButton: {
    marginLeft: 10,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchModal: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchModalInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  closeButton: {
    marginLeft: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  searchResults: {
    padding: 20,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptySearchText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LibraryScreen;
