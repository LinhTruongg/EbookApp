import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants';
import { apiService } from '../../../services/api';
import { Book } from '../../../types';

const { width: screenWidth } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [bestsellerBooks, setBestsellerBooks] = useState<Book[]>([]);
  const [newReleaseBooks, setNewReleaseBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🏠 HomeScreen - RENDERED! Welcome to the app!');
  console.log('🏠 HomeScreen - User:', user?.firstName, user?.lastName);

  useEffect(() => {
    loadBooksData();
  }, []);

  const loadBooksData = async () => {
    try {
      setIsLoading(true);
      
      // Load all books, featured, bestsellers, and new releases in parallel
      const [allBooksResponse, featuredResponse, bestsellerResponse, newReleaseResponse] = await Promise.all([
        apiService.getBooks(),
        apiService.getFeaturedBooks(),
        apiService.getBestsellerBooks(),
        apiService.getNewReleaseBooks()
      ]);

      if (allBooksResponse.success && allBooksResponse.data) {
        setAllBooks(allBooksResponse.data.books || []);
      }

      if (featuredResponse.success && featuredResponse.data) {
        setFeaturedBooks(featuredResponse.data || []);
      }

      if (bestsellerResponse.success && bestsellerResponse.data) {
        setBestsellerBooks(bestsellerResponse.data || []);
      }

      if (newReleaseResponse.success && newReleaseResponse.data) {
        setNewReleaseBooks(newReleaseResponse.data || []);
      }

    } catch (error) {
      console.error('Error loading books data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sách');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadBooksData();
  };

  // Get books based on active tab
  const getBooksForActiveTab = () => {
    switch (activeTab) {
      case 'popular':
        return bestsellerBooks;
      case 'newest':
        return newReleaseBooks;
      default:
        return allBooks;
    }
  };

  const tabs = [
    { key: 'explore', label: 'Khám phá' },
    { key: 'popular', label: 'Phổ biến' },
    { key: 'newest', label: 'Mới nhất' }
  ];

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const getCategoryMetaBySectionTitle = (title: string) => {
    switch (title) {
      case 'Kỹ Năng Mềm':
        return {
          id: '4',
          name: 'KỸ NĂNG MỀM',
          description: 'Khám phá các cuốn sách hay nhất trong thể loại KỸ NĂNG MỀM',
          icon: '☕',
        };
      case 'Tâm Lý Học':
        return {
          id: 'Psychology',
          name: 'TÂM LÝ HỌC',
          description: 'Khám phá các cuốn sách hay nhất trong thể loại TÂM LÝ HỌC',
          icon: '🧠',
        };
      default:
        return {
          id: title.toLowerCase().replace(/\s+/g, '-'),
          name: title.toUpperCase(),
          description: `Khám phá các cuốn sách hay nhất trong thể loại ${title}`,
          icon: '📚',
        };
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const authors = item.authors?.map(author => author.name).join(', ') || 'Unknown';
    const finalPrice = item.discountPrice || item.price;
    
    return (
      <TouchableOpacity 
        style={styles.bookItem}
        onPress={() => navigation.navigate('BookDetail', { book: item })}
      >
        <Image 
          source={{ uri: item.coverImage || 'https://via.placeholder.com/150x200/CCCCCC/FFFFFF?text=No+Image' }} 
          style={styles.bookCover} 
        />
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{authors}</Text>
        {finalPrice && (
          <Text style={styles.bookPrice}>
            {parseFloat(finalPrice).toLocaleString('vi-VN')}đ
          </Text>
        )}
        {item.rating && parseFloat(item.rating) > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  const renderBookSection = (title: string, books: any[], showAll: boolean = true) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showAll && (
          <TouchableOpacity
            onPress={() => {
              const category = getCategoryMetaBySectionTitle(title);
              navigation.navigate('CategoryDetail', { category });
            }}
          >
            <Text style={styles.seeAllText}>Tất cả ></Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        
        {/* Navigation Bar */}
        <View style={styles.navigationBar}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải sách...</Text>
          </View>
        ) : (
          <>
            {/* Featured Books Carousel */}
            {featuredBooks.length > 0 && (
              <View style={styles.featuredSection}>
                <Text style={styles.featuredTitle}>Sách Nổi Bật</Text>
                <FlatList
                  data={featuredBooks}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredBooksList}
                />
              </View>
            )}

            {/* Tab-based Book Sections */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'popular' ? 'Sách Bán Chạy' : 
                   activeTab === 'newest' ? 'Sách Mới' : 'Tất Cả Sách'}
                </Text>
              </View>
              <FlatList
                data={getBooksForActiveTab()}
                renderItem={renderBookItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksList}
              />
            </View>

            {/* Additional sections based on data */}
            {bestsellerBooks.length > 0 && activeTab !== 'popular' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Sách Bán Chạy</Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab('popular')}
                  >
                    <Text style={styles.seeAllText}>Xem tất cả ></Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={bestsellerBooks.slice(0, 5)}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.booksList}
                />
              </View>
            )}

            {newReleaseBooks.length > 0 && activeTab !== 'newest' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Sách Mới</Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab('newest')}
                  >
                    <Text style={styles.seeAllText}>Xem tất cả ></Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={newReleaseBooks.slice(0, 5)}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.booksList}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingBottom: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
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
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  featuredSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.lg,
    marginTop: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featuredBooksList: {
    paddingHorizontal: SIZES.spacing.lg,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  booksList: {
    paddingHorizontal: SIZES.spacing.lg,
  },
  bookItem: {
    marginRight: SIZES.spacing.md,
    width: 120,
  },
  bookCover: {
    width: 120,
    height: 160,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.sm,
  },
  bookTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
    lineHeight: 18,
  },
  bookAuthor: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bookPrice: {
    fontSize: SIZES.font.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SIZES.spacing.xs,
  },
  ratingContainer: {
    marginTop: SIZES.spacing.xs,
  },
  ratingText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  featuredTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
});

export default HomeScreen;
