import React, { useEffect, useState } from 'react';
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants';
import { Book, Comment, CommentsResponse, Rating, RatingStats } from '../../../types';
import { apiService } from '../../../services/api';
import { eventBus } from '../../../utils/eventBus';
import StarRating from '../../../components/common/StarRating';
import RatingDistributionChart from '../../../components/common/RatingDistributionChart';
import LoadingStarRating from '../../../components/common/LoadingStarRating';

const { width: screenWidth } = Dimensions.get('window');

interface BookDetailScreenProps {
  book: Book;
  initialInWishlist?: boolean;
}

const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ book, initialInWishlist = false }) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [posting, setPosting] = useState<boolean>(false);
  const [inWishlist, setInWishlist] = useState<boolean>(initialInWishlist);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);

  const authors = book.authors?.map(author => author.name).join(', ') || 'Unknown Author';
  // Removed pricing logic as this is now a free reading app

  const handleReadBook = () => {
    router.push(`/book-reader/${book.id}`);
  };

  // Removed purchase functionality as this is now a free reading app

  const handleGoBack = () => {
    const canGoBack = typeof (router as any).canGoBack === 'function' ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await apiService.getBookComments(book.id, 1, 20);
      if (res.success && res.data) {
        setComments(res.data.comments);
      }
    } catch (e) {
      // ignore for now
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadSuggestedBooks = async () => {
    try {
      setSuggestedLoading(true);
      const res = await apiService.getSuggestedBooks(book.id, 6);
      if (res.success && res.data) {
        setSuggestedBooks(res.data);
      }
    } catch (e) {
      // ignore for now
    } finally {
      setSuggestedLoading(false);
    }
  };

  const loadRatingData = async () => {
    try {
      setRatingLoading(true);
      const [userRatingRes, ratingStatsRes] = await Promise.all([
        apiService.getUserRating(book.id),
        apiService.getBookRatingStats(book.id)
      ]);
      
      if (userRatingRes.success) {
        setUserRating(userRatingRes.data);
      }
      
      if (ratingStatsRes.success && ratingStatsRes.data) {
        setRatingStats(ratingStatsRes.data);
      }
    } catch (e) {
      // ignore for now
    } finally {
      setRatingLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    try {
      setRatingLoading(true);
      const res = await apiService.createOrUpdateRating(book.id, rating);
      if (res.success && res.data) {
        setUserRating(res.data);
        // Reload rating stats to update average
        const statsRes = await apiService.getBookRatingStats(book.id);
        if (statsRes.success && statsRes.data) {
          setRatingStats(statsRes.data);
        }
      }
    } catch (e) {
      // ignore for now
    } finally {
      setRatingLoading(false);
    }
  };

  const handlePostComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    try {
      setPosting(true);
      const res = await apiService.createComment(book.id, { content });
      if (res.success && res.data) {
        setNewComment('');
        // Prepend new comment
        setComments(prev => [res.data as unknown as Comment, ...prev]);
      }
    } catch (e) {
      // ignore for now
    } finally {
      setPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await apiService.likeComment(commentId);
      if (res.success && res.data) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, hasLiked: res.data.hasLiked, likesCount: res.data.likesCount } : c));
      }
    } catch (e) {
      // ignore for now
    }
  };

  useEffect(() => {
    loadComments();
    loadSuggestedBooks();
    loadRatingData();
  }, [book.id]);

  const toggleWishlist = async () => {
    try {
      const res = await apiService.toggleWishlist(book.id);
      if (res.success && res.data) {
        const next = (res.data as any).inWishlist;
        setInWishlist(next);
        eventBus.emit('wishlist:toggle', { book, inWishlist: next });
      }
    } catch (e) {
      // ignore for now
    }
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
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleWishlist} accessibilityLabel="Yêu thích">
          <Text style={[styles.favoriteButtonText, inWishlist && styles.favorited]}>{inWishlist ? '❤️' : '♡'}</Text>
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
            <View style={styles.ratingContainer}>
              {ratingLoading ? (
                <View style={styles.ratingLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                </View>
              ) : (
                <View style={styles.ratingSection}>
                  <StarRating
                    rating={ratingStats?.averageRating || book.rating || 0}
                    size="medium"
                    showText={true}
                  />
                  <Text style={styles.reviewsText}>
                    ({ratingStats?.totalRatings || book.reviewCount || 0} đánh giá)
                  </Text>
                </View>
              )}
            </View>

            {/* Category */}
            {book.categories && book.categories.length > 0 && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>📂 {book.categories[0].name}</Text>
              </View>
            )}

            {/* Free reading app - no pricing needed */}
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

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Đánh giá sách</Text>
          
          {/* Current Rating Display */}
          <View style={styles.currentRatingContainer}>
            <View style={styles.ratingDisplay}>
              <StarRating
                rating={ratingStats?.averageRating || book.rating || 0}
                size="large"
                showText={true}
              />
              <Text style={styles.ratingCount}>
                {ratingStats?.totalRatings || book.reviewCount || 0} đánh giá
              </Text>
            </View>
          </View>

          {/* Rating Distribution Chart */}
          {ratingStats && ratingStats.totalRatings > 0 && (
            <RatingDistributionChart
              ratingDistribution={ratingStats.ratingDistribution}
              totalRatings={ratingStats.totalRatings}
            />
          )}

          {/* User Rating Input */}
          <View style={styles.userRatingContainer}>
            <Text style={styles.userRatingTitle}>Đánh giá của bạn</Text>
            {ratingLoading ? (
              <LoadingStarRating />
            ) : (
              <View style={styles.ratingInputContainer}>
                <StarRating
                  rating={userRating?.rating || 0}
                  onRatingChange={handleRatingChange}
                  size="large"
                  interactive={true}
                  showText={false}
                />
                {userRating && (
                  <Text style={styles.ratingStatusText}>
                    Cảm ơn bạn đã đánh giá {userRating.rating} sao!
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

      {/* Comments */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Bình luận</Text>

        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Viết bình luận..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, posting && styles.sendButtonDisabled]} onPress={handlePostComment} disabled={posting}>
            <Text style={styles.sendButtonText}>{posting ? '...' : 'Gửi'}</Text>
          </TouchableOpacity>
        </View>

        {commentsLoading ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải bình luận...</Text>
          </View>
        ) : (
          <View>
            {comments.length === 0 ? (
              <Text style={styles.emptyComments}>Chưa có bình luận nào</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{c.user?.name || 'Người dùng'}</Text>
                    <Text style={styles.commentTime}>{c.timeAgo || ''}</Text>
                  </View>
                  <Text style={styles.commentContent}>{c.content}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.likeButton} onPress={() => handleLikeComment(c.id)}>
                      <Text style={[styles.likeText, c.hasLiked && styles.liked]}>❤️ {c.likesCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Suggested Books */}
      {suggestedBooks.length > 0 && (
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>Sách cùng chủ đề</Text>
          {suggestedLoading ? (
            <View style={styles.suggestedLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải sách gợi ý...</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScroll}
            >
              {suggestedBooks.map((suggestedBook) => (
                <TouchableOpacity 
                  key={suggestedBook.id} 
                  style={styles.suggestedItem}
                  onPress={() => router.push(`/book-detail/${suggestedBook.id}`)}
                >
                  <Image 
                    source={{ 
                      uri: suggestedBook.coverImage || 'https://via.placeholder.com/120x160/CCCCCC/FFFFFF?text=No+Image' 
                    }} 
                    style={styles.suggestedCover} 
                  />
                  <Text style={styles.suggestedTitle} numberOfLines={2}>
                    {suggestedBook.title}
                  </Text>
                  <Text style={styles.suggestedAuthor} numberOfLines={1}>
                    {suggestedBook.authors?.map(author => author.name).join(', ') || 'Unknown Author'}
                  </Text>
                  <Text style={styles.suggestedPrice}>
                    Đọc miễn phí
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.readButton} onPress={handleReadBook}>
          <Text style={styles.readButtonText}>📖 Đọc sách</Text>
        </TouchableOpacity>
        {/* Removed purchase button as this is now a free reading app */}
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
  favorited: {
    color: '#e11d48',
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
    marginBottom: SIZES.spacing.sm,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
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
  ratingLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  ratingSection: {
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  currentRatingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingDisplay: {
    alignItems: 'center',
    gap: 8,
  },
  ratingCount: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userRatingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userRatingTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingInputContainer: {
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  ratingStatusText: {
    fontSize: SIZES.font.md,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
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
  commentsSection: {
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.spacing.md,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    minHeight: 44,
    backgroundColor: COLORS.surface,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
  emptyComments: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  commentItem: {
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: '600',
    color: COLORS.text,
  },
  commentTime: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  commentContent: {
    color: COLORS.text,
    marginTop: 2,
  },
  commentActions: {
    marginTop: 6,
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likeText: {
    color: COLORS.textSecondary,
  },
  liked: {
    color: '#e11d48',
    fontWeight: '700',
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
  suggestedSection: {
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  suggestedLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  suggestedScroll: {
    paddingRight: SIZES.spacing.lg,
  },
  suggestedItem: {
    width: 120,
    marginRight: SIZES.spacing.md,
  },
  suggestedCover: {
    width: 120,
    height: 160,
    borderRadius: SIZES.borderRadius.md,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.sm,
  },
  suggestedTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    lineHeight: 16,
  },
  suggestedAuthor: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  suggestedPrice: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default BookDetailScreen;