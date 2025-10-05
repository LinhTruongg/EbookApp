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
    // Mock data for books in this category
    const mockBooks = [
      {
        id: '1',
        title: 'TÔI TÀI GIỎI BẠN CŨNG THẾ!',
        author: 'Adam Khoo',
        coverImage: 'https://via.placeholder.com/150x200/4CAF50/FFFFFF?text=TÔI+TÀI+GIỎI',
        price: '99.000đ',
        originalPrice: '149.000đ',
        rating: 4.5,
        reviews: 128,
        description: 'Cuốn sách giúp bạn phát triển tư duy và kỹ năng học tập hiệu quả.',
      },
      {
        id: '2',
        title: 'NGHỆ THUẬT GIAO TIẾP ĐỂ THÀNH CÔNG',
        author: 'Unknown',
        coverImage: 'https://via.placeholder.com/150x200/FFC107/000000?text=NGHỆ+THUẬT',
        price: '89.000đ',
        originalPrice: '129.000đ',
        rating: 4.2,
        reviews: 95,
        description: 'Học cách giao tiếp hiệu quả để đạt được thành công trong cuộc sống.',
      },
      {
        id: '3',
        title: 'Tuổi trẻ đáng giá bao nhiêu?',
        author: 'Rosie Nguyễn',
        coverImage: 'https://via.placeholder.com/150x200/2196F3/FFFFFF?text=Tuổi+trẻ',
        price: '79.000đ',
        originalPrice: '119.000đ',
        rating: 4.7,
        reviews: 203,
        description: 'Những bài học quý giá về tuổi trẻ và cách sống có ý nghĩa.',
      },
      {
        id: '4',
        title: 'DẠY CON LÀM GIÀU',
        author: 'Robert Kiyosaki',
        coverImage: 'https://via.placeholder.com/150x200/9C27B0/FFFFFF?text=RICH+DAD',
        price: '109.000đ',
        originalPrice: '159.000đ',
        rating: 4.4,
        reviews: 156,
        description: 'Kiến thức về tài chính và cách xây dựng sự giàu có.',
      },
      {
        id: '5',
        title: 'trên đường bằng',
        author: 'Unknown',
        coverImage: 'https://via.placeholder.com/150x200/000000/FFFFFF?text=trên+đường',
        price: '69.000đ',
        originalPrice: '99.000đ',
        rating: 4.1,
        reviews: 87,
        description: 'Hành trình khám phá bản thân và tìm kiếm ý nghĩa cuộc sống.',
      },
      {
        id: '6',
        title: 'ĐẮC NHÂN TÂM',
        author: 'Dale Carnegie',
        coverImage: 'https://via.placeholder.com/150x200/F44336/FFFFFF?text=ĐẮC+NHÂN+TÂM',
        price: '95.000đ',
        originalPrice: '139.000đ',
        rating: 4.6,
        reviews: 312,
        description: 'Nghệ thuật thu phục lòng người và xây dựng mối quan hệ tốt đẹp.',
      },
    ];

    // Simulate loading
    setTimeout(() => {
      setBooks(mockBooks);
      setLoading(false);
    }, 1000);
  }, [category]);

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
          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
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
