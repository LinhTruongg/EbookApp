import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { apiService } from '../../services/api';
import { Book } from '../../types';

interface SearchBarProps {
  onBookSelect?: (book: Book) => void;
  placeholder?: string;
  showHistory?: boolean;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onBookSelect,
  placeholder = "Tìm kiếm sách, tác giả...",
  showHistory = true,
  style
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Popular search terms
  const popularSearches = ['tư duy', 'giao tiếp', 'tài chính', 'kỹ năng', 'phát triển'];

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await apiService.searchBooks(query);
      
      if (response.success && response.data) {
        setSearchResults(response.data || []);
        
        // Add to search history
        if (showHistory && !searchHistory.includes(query.trim())) {
          setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 2) {
      // Debounce search to avoid too many API calls
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300) as any;
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchPress = () => {
    setShowSearchModal(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchResultPress = (book: Book) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    if (onBookSelect) {
      onBookSelect(book);
    }
  };

  const handleSearchHistoryPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handlePopularSearchPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResultItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleSearchResultPress(item)}
    >
      <Image 
        source={{ uri: item.coverImage || 'https://via.placeholder.com/80x100/CCCCCC/FFFFFF?text=No+Image' }} 
        style={styles.searchResultCover} 
      />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.searchResultAuthor} numberOfLines={1}>
          {item.authors?.map(author => author.name).join(', ') || 'Tác giả không xác định'}
        </Text>
        <Text style={styles.searchResultCategory}>{item.category?.name || 'Không phân loại'}</Text>
        <View style={styles.searchResultFooter}>
          
          {item.rating && parseFloat(item.rating.toString()) > 0 && (
            <Text style={styles.searchResultRating}>⭐ {item.rating}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.searchHistoryItem}
      onPress={() => handleSearchHistoryPress(item)}
    >
      <Text style={styles.searchHistoryText}>🔍 {item}</Text>
    </TouchableOpacity>
  );

  const renderPopularSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.popularSearchItem}
      onPress={() => handlePopularSearchPress(item)}
    >
      <Text style={styles.popularSearchText}>🔥 {item}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity style={[styles.searchButton, style]} onPress={handleSearchPress}>
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModalContainer}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              onPress={() => setShowSearchModal(false)}
              style={styles.searchBackButton}
            >
              <Text style={styles.searchBackButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.searchInputContainer}>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoFocus
              />
            </View>
          </View>

          {/* Search Content */}
          <View style={styles.searchContent}>
            {!searchQuery.trim() ? (
              // Show suggestions when no search query
              <View style={styles.suggestionsContainer}>
                {showHistory && searchHistory.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
                    <FlatList
                      data={searchHistory}
                      renderItem={renderSearchHistoryItem}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
                  <FlatList
                    data={popularSearches}
                    renderItem={renderPopularSearchItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularSearchesList}
                  />
                </View>
              </View>
            ) : (
              // Show search results
              <View style={styles.searchResultsContainer}>
                <Text style={styles.sectionTitle}>
                  {isSearching ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm (${searchResults.length})`}
                </Text>
                
                {isSearching ? (
                  <View style={styles.searchLoadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.searchLoadingText}>Đang tìm kiếm...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResultItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noSearchResultsContainer}>
                    <Text style={styles.noSearchResultsText}>🔍 Không tìm thấy kết quả nào</Text>
                    <Text style={styles.noSearchResultsSubtext}>Thử tìm kiếm với từ khóa khác</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    padding: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    marginLeft: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: SIZES.icon.sm,
    color: COLORS.text,
  },

  // Search Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBackButton: {
    padding: SIZES.spacing.sm,
    marginRight: SIZES.spacing.sm,
  },
  searchBackButtonText: {
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
  searchContent: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
  },
  suggestionsContainer: {
    flex: 1,
    paddingTop: SIZES.spacing.lg,
  },
  section: {
    marginBottom: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  searchHistoryItem: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchHistoryText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  popularSearchesList: {
    paddingVertical: SIZES.spacing.sm,
  },
  popularSearchItem: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  popularSearchText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  searchResultsContainer: {
    flex: 1,
    paddingTop: SIZES.spacing.lg,
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
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  searchLoadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  searchLoadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
  },
  noSearchResultsContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  noSearchResultsText: {
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  noSearchResultsSubtext: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SearchBar;
