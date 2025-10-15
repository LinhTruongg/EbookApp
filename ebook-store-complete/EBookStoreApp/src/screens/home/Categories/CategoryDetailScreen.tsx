import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES, COMMON_STYLES } from '../../../constants';
import { apiService } from '../../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryDetailScreenProps {
  route: {
    params: {
      category: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
      };
    };
  };
  navigation: any;
}

const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({ route, navigation }) => {
  const { category } = route.params;
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBooksByCategoryId(String(category.id));
        const serverBooks = (response.data?.books || []).map((b: any) => {
          const authorNames = Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.map((a: any) => a.name).join(', ') : '';
          const hasDiscount = b.discountPrice && Number(b.discountPrice) < Number(b.price);
          const finalPrice = hasDiscount ? Number(b.discountPrice) : Number(b.price);
          return {
            id: String(b.id),
            title: b.title,
            author: authorNames,
            coverImage: b.coverImage,
            price: formatCurrency(finalPrice),
            originalPrice: hasDiscount ? formatCurrency(Number(b.price)) : undefined,
            rating: Number(b.rating || 0),
            reviews: Number(b.totalReviews || 0),
            description: b.description,
          };
        });
        if (isMounted) {
          setBooks(serverBooks);
        }
      } catch (e) {
        if (isMounted) {
          setBooks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, [category]);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
    } catch {
      return `${Math.round(value).toLocaleString('vi-VN')} đ`;
    }
  };

  const renderBookItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
          {item.originalPrice ? (
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryIcon}>{category.icon || '📚'}</Text>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>
            {category.description || `Khám phá ${books.length} cuốn sách trong thể loại ${category.name}`}
          </Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{books.length}</Text>
          <Text style={styles.statLabel}>Sách</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.4</Text>
          <Text style={styles.statLabel}>Đánh giá TB</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  listContainer: {
    padding: SIZES.spacing.lg,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  categoryIcon: {
    fontSize: 48,
    marginRight: SIZES.spacing.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  categoryDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs,
  },
  statLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    width: (screenWidth - SIZES.spacing.lg * 3) / 2,
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
    height: 200,
    borderRadius: SIZES.borderRadius.md,
    marginBottom: SIZES.spacing.sm,
  },
  bookInfo: {
    flex: 1,
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
    marginBottom: SIZES.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  rating: {
    fontSize: SIZES.font.xs,
    color: COLORS.accent,
    marginRight: SIZES.spacing.xs,
  },
  reviews: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: SIZES.font.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SIZES.spacing.xs,
  },
  originalPrice: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
});

export default CategoryDetailScreen;
