import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants/index';
import { apiService } from '../../../services/api';

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const searchInputRef = useRef<TextInput>(null);

  // All books data for search
  const allBooks = [
    {
      id: '1',
      title: 'TÔI TÀI GIỎI BẠN CŨNG THẾ!',
      author: 'Adam Khoo',
      coverImage: 'https://via.placeholder.com/150x200/4CAF50/FFFFFF?text=TÔI+TÀI+GIỎI',
      category: 'Self Help',
      price: 99000,
      rating: 4.5,
      description: 'Cuốn sách về phát triển bản thân và kỹ năng học tập'
    },
    {
      id: '2',
      title: 'NGHỆ THUẬT GIAO TIẾP ĐỂ THÀNH CÔNG',
      author: 'Unknown',
      coverImage: 'https://via.placeholder.com/150x200/FFC107/000000?text=NGHỆ+THUẬT',
      category: 'Communication',
      price: 85000,
      rating: 4.2,
      description: 'Học cách giao tiếp hiệu quả trong công việc và cuộc sống'
    },
    {
      id: '3',
      title: 'Tuổi trẻ đáng giá bao nhiêu?',
      author: 'Rosie Nguyễn',
      coverImage: 'https://via.placeholder.com/150x200/2196F3/FFFFFF?text=Tuổi+trẻ',
      category: 'Life',
      price: 120000,
      rating: 4.7,
      description: 'Những bài học quý giá cho tuổi trẻ'
    },
    {
      id: '4',
      title: 'DẠY CON LÀM GIÀU',
      author: 'Robert Kiyosaki',
      coverImage: 'https://via.placeholder.com/150x200/9C27B0/FFFFFF?text=RICH+DAD',
      category: 'Finance',
      price: 150000,
      rating: 4.6,
      description: 'Kiến thức tài chính cơ bản cho mọi người'
    },
    {
      id: '5',
      title: 'trên đường bằng',
      author: 'Unknown',
      coverImage: 'https://via.placeholder.com/150x200/000000/FFFFFF?text=trên+đường',
      category: 'Travel',
      price: 75000,
      rating: 4.0,
      description: 'Những chuyến phiêu lưu trên đường'
    },
    {
      id: '6',
      title: 'ĐẮC NHÂN TÂM',
      author: 'Dale Carnegie',
      coverImage: 'https://via.placeholder.com/150x200/F44336/FFFFFF?text=ĐẮC+NHÂN+TÂM',
      category: 'Soft Skills',
      price: 110000,
      rating: 4.8,
      description: 'Nghệ thuật thu phục lòng người'
    },
    {
      id: '7',
      title: 'Khéo ăn nói sẽ có được thiên hạ',
      author: 'Unknown',
      coverImage: 'https://via.placeholder.com/150x200/FF9800/FFFFFF?text=Khéo+ăn+nói',
      category: 'Soft Skills',
      price: 95000,
      rating: 4.3,
      description: 'Kỹ năng giao tiếp và thuyết trình'
    },
    {
      id: '8',
      title: 'BEING MORTAL',
      author: 'Atul Gawande',
      coverImage: 'https://via.placeholder.com/150x200/795548/FFFFFF?text=BEING+MORTAL',
      category: 'Soft Skills',
      price: 130000,
      rating: 4.4,
      description: 'Về cái chết và y học'
    },
    {
      id: '9',
      title: 'Nói nhiều không bằng nói đúng',
      author: 'Unknown',
      coverImage: 'https://via.placeholder.com/150x200/FFFFFF/000000?text=Nói+nhiều',
      category: 'Psychology',
      price: 80000,
      rating: 4.1,
      description: 'Nghệ thuật giao tiếp thông minh'
    },
    {
      id: '10',
      title: 'TƯ DUY NHANH VÀ CHẬM',
      author: 'Daniel Kahneman',
      coverImage: 'https://via.placeholder.com/150x200/FFFFFF/000000?text=TƯ+DUY+NHANH',
      category: 'Psychology',
      price: 160000,
      rating: 4.9,
      description: 'Hai hệ thống tư duy của con người'
    },
    {
      id: '11',
      title: 'LÀM CHỦ TƯ DUY THAY ĐỔI VẬN MỆNH',
      author: 'Adam Khoo',
      coverImage: 'https://via.placeholder.com/150x200/2196F3/FFFFFF?text=LÀM+CHỦ+TƯ+DUY',
      category: 'Psychology',
      price: 140000,
      rating: 4.6,
      description: 'Phương pháp thay đổi tư duy để thành công'
    }
  ];

  const filterOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'Self Help', label: 'Self Help' },
    { key: 'Communication', label: 'Giao tiếp' },
    { key: 'Life', label: 'Cuộc sống' },
    { key: 'Finance', label: 'Tài chính' },
    { key: 'Travel', label: 'Du lịch' },
    { key: 'Soft Skills', label: 'Kỹ năng mềm' },
    { key: 'Psychology', label: 'Tâm lý học' }
  ];

  // Search functions
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Use real API for search
      const response = await apiService.searchBooks(query);
      
      if (response.success && response.data) {
        let filteredBooks = response.data || [];
        
        // Apply category filter
        if (selectedFilter !== 'all') {
          filteredBooks = filteredBooks.filter((book: any) => book.category === selectedFilter);
        }
        
        setSearchResults(filteredBooks);
      } else {
        // Fallback to local data if API fails
        const filteredBooks = allBooks.filter(book => {
          const searchLower = query.toLowerCase();
          return (
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.category.toLowerCase().includes(searchLower) ||
            book.description.toLowerCase().includes(searchLower)
          );
        });

        const finalResults = selectedFilter === 'all' 
          ? filteredBooks 
          : filteredBooks.filter(book => book.category === selectedFilter);

        setSearchResults(finalResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local data
      const filteredBooks = allBooks.filter(book => {
        const searchLower = query.toLowerCase();
        return (
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.category.toLowerCase().includes(searchLower) ||
          book.description.toLowerCase().includes(searchLower)
        );
      });

      const finalResults = selectedFilter === 'all' 
        ? filteredBooks 
        : filteredBooks.filter(book => book.category === selectedFilter);

      setSearchResults(finalResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
    
    // Add to search history
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  // Generate suggestions based on search history and popular terms
  useEffect(() => {
    const popularTerms = ['tư duy', 'giao tiếp', 'tài chính', 'kỹ năng', 'phát triển'];
    const combinedSuggestions = [...searchHistory, ...popularTerms];
    setSuggestions(combinedSuggestions.slice(0, 5));
  }, [searchHistory]);

  // Focus search input when screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderSearchResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.coverImage }} style={styles.searchResultCover} />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.searchResultAuthor} numberOfLines={1}>{item.author}</Text>
        <Text style={styles.searchResultCategory}>{item.category}</Text>
        <View style={styles.searchResultFooter}>
          <Text style={styles.searchResultPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
          <View style={styles.searchResultRating}>
            <Text style={styles.searchResultRatingText}>⭐ {item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderFilterChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item.key && styles.activeFilterChip
      ]}
      onPress={() => handleFilterChange(item.key)}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === item.key && styles.activeFilterChipText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Tìm kiếm sách, tác giả, thể loại..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!searchQuery.trim() ? (
          // Show suggestions when no search query
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
            
            {searchHistory.length > 0 && (
              <View style={styles.searchHistorySection}>
                <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
                <FlatList
                  data={searchHistory}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestionsList}
                />
              </View>
            )}
          </View>
        ) : (
          // Show search results
          <View style={styles.resultsContainer}>
            {/* Filter Chips */}
            <View style={styles.filtersSection}>
              <FlatList
                data={filterOptions}
                renderItem={renderFilterChip}
                keyExtractor={(item) => item.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersList}
              />
            </View>

            {/* Search Results */}
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                {isSearching ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm (${searchResults.length})`}
              </Text>
              
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>🔍 Đang tìm kiếm...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResultItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>🔍 Không tìm thấy kết quả nào</Text>
                  <Text style={styles.noResultsSubtext}>Thử tìm kiếm với từ khóa khác</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.spacing.sm,
    marginRight: SIZES.spacing.sm,
  },
  backButtonText: {
    fontSize: SIZES.font.xl,
    color: COLORS.text,
    fontWeight: '600',
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  searchInput: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    paddingVertical: SIZES.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
  },
  
  // Suggestions Styles
  suggestionsContainer: {
    flex: 1,
    paddingTop: SIZES.spacing.lg,
  },
  suggestionsList: {
    paddingVertical: SIZES.spacing.md,
  },
  suggestionItem: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    marginRight: SIZES.spacing.sm,
  },
  suggestionText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  searchHistorySection: {
    marginTop: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  
  // Results Styles
  resultsContainer: {
    flex: 1,
    paddingTop: SIZES.spacing.lg,
  },
  filtersSection: {
    marginBottom: SIZES.spacing.lg,
  },
  filtersList: {
    paddingVertical: SIZES.spacing.sm,
  },
  filterChip: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  
  // Search Results Styles
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.lg,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultCover: {
    width: 80,
    height: 100,
    borderRadius: SIZES.borderRadius.md,
    marginRight: SIZES.spacing.md,
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  searchResultTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
    lineHeight: 20,
  },
  searchResultAuthor: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  searchResultCategory: {
    fontSize: SIZES.font.xs,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  searchResultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultPrice: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultRatingText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  
  // Loading and No Results Styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  loadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  noResultsText: {
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  noResultsSubtext: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen;