import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants';
import { Book } from '../../../types';

const { width: screenWidth } = Dimensions.get('window');

interface BookDetailScreenProps {
  book: Book;
}

const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ book }) => {
  const router = useRouter();

  const authors = book.authors?.map(author => author.name).join(', ') || 'Unknown Author';
  const finalPrice = book.discountPrice || book.price;
  const hasDiscount = book.discountPrice && book.discountPrice < book.price;

  const handleReadBook = () => {
    router.push(`/book-reader/${book.id}`);
  };

  const handlePurchase = () => {
    router.push(`/payment-method/${book.id}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sách</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteButtonText}>♡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Cover and Basic Info */}
        <View style={styles.bookSection}>
          <Image 
            source={{ 
              uri: book.coverImage || 'https://via.placeholder.com/200x300/CCCCCC/FFFFFF?text=No+Image' 
            }} 
            style={styles.bookCover} 
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{authors}</Text>
            
            {/* Rating */}
            {book.rating && book.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {book.rating}</Text>
                <Text style={styles.reviewsText}>({book.reviewCount || 0} đánh giá)</Text>
              </View>
            )}

            {/* Category */}
            {book.categories && book.categories.length > 0 && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>📂 {book.categories[0].name}</Text>
              </View>
            )}

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                {finalPrice ? `${finalPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
              </Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>
                  {book.price.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Book Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhà xuất bản:</Text>
            <Text style={styles.detailValue}>{book.publisher || 'Chưa có thông tin'}</Text>
          </View>
          
          {book.publishedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày xuất bản:</Text>
              <Text style={styles.detailValue}>{new Date(book.publishedDate).toLocaleDateString('vi-VN')}</Text>
            </View>
          )}
          
          {book.pageCount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số trang:</Text>
              <Text style={styles.detailValue}>{book.pageCount} trang</Text>
            </View>
          )}
          
          {book.isbn && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ISBN:</Text>
              <Text style={styles.detailValue}>{book.isbn}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngôn ngữ:</Text>
            <Text style={styles.detailValue}>{book.language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
          </View>
        </View>

        {/* Description */}
        {book.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{book.description}</Text>
          </View>
        )}

        {/* Badges */}
        <View style={styles.badgesSection}>
          {book.isFeatured && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ Nổi bật</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.readButton} onPress={handleReadBook}>
          <Text style={styles.readButtonText}>📖 Đọc sách</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>💳 Mua sách</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonText: {
    fontSize: 20,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  bookSection: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.lg,
  },
  bookCover: {
    width: 140,
    height: 200,
    borderRadius: SIZES.borderRadius.md,
    backgroundColor: COLORS.surface,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
    lineHeight: 28,
  },
  bookSubtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  ratingText: {
    fontSize: SIZES.font.sm,
    color: COLORS.accent,
    marginRight: SIZES.spacing.xs,
  },
  reviewsText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  categoryContainer: {
    marginBottom: SIZES.spacing.sm,
  },
  categoryText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  currentPrice: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  detailsSection: {
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  detailLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  descriptionSection: {
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  descriptionText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  badgesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
  },
  badgeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  readButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BookDetailScreen;