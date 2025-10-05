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
} from 'react-native';
import { COLORS, SIZES } from '../../../constants';

interface LibraryScreenProps {
  navigation: any;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  category: string;
  progress?: number; // 0-100
}

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'want-to-read' | 'read'>('reading');
  const [books, setBooks] = useState<{
    reading: Book[];
    wantToRead: Book[];
    read: Book[];
  }>({
    reading: [],
    wantToRead: [],
    read: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const tabs = [
    { key: 'reading', label: 'Đang đọc' },
    { key: 'want-to-read', label: 'Muốn đọc' },
    { key: 'read', label: 'Đã đọc' },
  ];

  // Sample data - in real app, this would come from API
  useEffect(() => {
    setBooks({
      reading: [
        {
          id: '1',
          title: 'ĐẮC NHÂN TÂM',
          author: 'Dale Carnegie',
          coverImage: 'https://via.placeholder.com/150x200/F44336/FFFFFF?text=ĐẮC+NHÂN+TÂM',
          category: 'Soft Skills',
          progress: 45
        }
      ],
      wantToRead: [
        {
          id: '2',
          title: 'TƯ DUY NHANH VÀ CHẬM',
          author: 'Daniel Kahneman',
          coverImage: 'https://via.placeholder.com/150x200/FFFFFF/000000?text=TƯ+DUY+NHANH',
          category: 'Psychology'
        }
      ],
      read: [
        {
          id: '3',
          title: 'TÔI TÀI GIỎI BẠN CŨNG THẾ!',
          author: 'Adam Khoo',
          coverImage: 'https://via.placeholder.com/150x200/4CAF50/FFFFFF?text=TÔI+TÀI+GIỎI',
          category: 'Self Help',
          progress: 100
        }
      ]
    });
  }, []);

  const getCurrentBooks = () => {
    const currentBooks = (() => {
      switch (activeTab) {
        case 'reading':
          return books.reading;
        case 'want-to-read':
          return books.wantToRead;
        case 'read':
          return books.read;
        default:
          return [];
      }
    })();

    // If searching, return filtered results
    if (searchQuery.trim()) {
      return currentBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return currentBooks;
  };

  const getAllBooks = () => {
    return [...books.reading, ...books.wantToRead, ...books.read];
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const allBooks = getAllBooks();
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.category.toLowerCase().includes(query.toLowerCase())
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
    navigation.navigate('BookReader', {
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
      }
    });
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.bookItem}
      onPress={() => handleBookPress(item)}
    >
      <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        {item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
      {searchQuery.trim() && (
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
        {getCurrentBooks().length > 0 ? (
          <FlatList
            data={getCurrentBooks()}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.booksList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'reading' && 'Chưa có sách nào đang đọc'}
              {activeTab === 'want-to-read' && 'Chưa có sách nào muốn đọc'}
              {activeTab === 'read' && 'Chưa có sách nào đã đọc'}
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
    borderBottomColor: COLORS.lightGray,
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
    flex: 1,
    margin: 8,
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
