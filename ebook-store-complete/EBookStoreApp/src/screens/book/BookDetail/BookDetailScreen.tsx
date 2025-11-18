import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../../constants';
import { Book, Comment, Rating, RatingStats } from '../../../types';
import { apiService } from '../../../services/api';
import { simpleApiService } from '../../../services/simpleApi';
import { useAuth } from '../../../context/AuthContext';
import { eventBus } from '../../../utils/eventBus';
import StarRating from '../../../components/common/StarRating';
import RatingDistributionChart from '../../../components/common/RatingDistributionChart';
import LoadingStarRating from '../../../components/common/LoadingStarRating';
import { Ionicons } from '@expo/vector-icons';

interface BookDetailScreenProps {
  book: Book;
  initialInWishlist?: boolean;
  initialIsUnlocked?: boolean;
  initialHasLiked?: boolean;
  initialLikeCount?: number;
}

const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ 
  book, 
  initialInWishlist = false, 
  initialIsUnlocked = false,
  initialHasLiked = false,
  initialLikeCount = 0
}) => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
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
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!!initialIsUnlocked);
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(initialHasLiked || book.hasLiked || false);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount || book.likesCount || 0);

  const authors = book.authors?.map(author => author.name).join(', ') || 'Unknown Author';
  const [requiresPoints, setRequiresPoints] = useState<boolean>((((book as any).pointsRequired ?? 0) > 0) || (book as any).isLockedByPoints);
  const [requiredPoints, setRequiredPoints] = useState<number>(Number(((book as any).pointsRequired || 0)));
  const userPoints = (user as any)?.points ?? 0;

  // Check if book is unlocked (in library)
  useEffect(() => {
    // Always refetch book detail to ensure we have latest lock flags
    (async () => {
      try {
        const res = await apiService.getBookById(book.id);
        if (res.success && res.data) {
          const srvBook = ((res.data as any).book ?? res.data) as any;
          const srvPointsRequired = Number(srvBook?.pointsRequired || 0);
          const srvLocked = Boolean(srvBook?.isLockedByPoints);
          setRequiresPoints((srvPointsRequired > 0) || srvLocked);
          setRequiredPoints(srvPointsRequired);
        }
      } catch (e: any) {
        // Silently handle error - use initial book data
      }
    })();

    const checkUnlocked = async () => {
      if (isUnlocked) {
        return;
      }
      if (!requiresPoints) {
        setIsUnlocked(true);
        return;
      }
      try {
        const libRes = await simpleApiService.getUserLibrary();
        if (libRes.success && libRes.data) {
          const allBooks = [
            ...(libRes.data.categories?.reading || []),
            ...(libRes.data.categories?.favorited || []),
            ...(libRes.data.categories?.completed || []),
          ];
          const found = allBooks.find((item: any) => item.book?.id === book.id || item.bookId === book.id);
          setIsUnlocked(!!found);
        }
      } catch (e: any) {
        // Silently handle error - assume not unlocked
      }
    };
    checkUnlocked();
  }, [book.id]);

  const handlePurchaseBook = async () => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để mua sách.');
      try {
        router.push('/(auth)/login');
      } catch (e: any) {
        // Silently handle navigation error
      }
      return;
    }

    if (userPoints < requiredPoints) {
      const shortage = requiredPoints - userPoints;
      Alert.alert(
        'Điểm không đủ',
        `Bạn cần thêm ${shortage.toLocaleString('vi-VN')} điểm để mua sách này.\n\nSố điểm hiện tại: ${userPoints.toLocaleString('vi-VN')}\nSố điểm cần: ${requiredPoints.toLocaleString('vi-VN')}`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Nạp điểm', 
            onPress: () => {
              try {
                router.push('/wallet/deposit');
              } catch (e: any) {
                // Silently handle navigation error
              }
            }
          },
        ]
      );
      return;
    }

    try {
      setUnlockLoading(true);
      const response = await apiService.purchaseBookWithPoints({ 
        bookId: String(book.id), 
        pricePoints: requiredPoints 
      });
      
      if (response.success) {
        if ((response as any).data?.alreadyOwned) {
          setRequiresPoints(false);
          setRequiredPoints(0);
          setIsUnlocked(true);
          Alert.alert('Thông báo', 'Bạn đã sở hữu sách này.');
          return;
        }
        // Update user points in context
        try {
          const balRes = await apiService.getWalletBalance();
          if (balRes.success && balRes.data && user) {
            updateUser({ ...(user as any), points: balRes.data.balance } as any);
          }
        } catch (e: any) {}
        try {
          await simpleApiService.addToLibrary(book.id);
        } catch (e: any) {
          // Silently handle - book might already be in library
        }
        // After unlocking, book is no longer locked by points
        setRequiresPoints(false);
        setRequiredPoints(0);
        setIsUnlocked(true);
        Alert.alert('Thành công', 'Đã mở khóa sách thành công!');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Không thể mua sách bằng điểm';
      Alert.alert('Lỗi', msg);
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleReadBook = async () => {
    if (requiresPoints && !isUnlocked) {
      Alert.alert('Yêu cầu mở khóa', 'Sách này cần điểm để mở khóa. Vui lòng mua trước khi đọc.');
      return;
    }
    try {
      // Add book to library first
      await simpleApiService.addToLibrary(book.id);
    } catch (e: any) {
      // Silently handle - book might already be in library, continue anyway
    }
    
    try {
      router.push(`/book-reader/${book.id}`);
    } catch (e: any) {
      // Silently handle navigation error
    }
  };

  const handleGoBack = () => {
    try {
      const canGoBack = typeof (router as any).canGoBack === 'function' ? (router as any).canGoBack() : false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      // Silently handle navigation error
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await apiService.getBookComments(book.id, 1, 20);
      if (res.success && res.data) {
        setComments(res.data.comments);
      }
    } catch (e: any) {
      // Silently handle error - keep empty comments array
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
    } catch (e: any) {
      // Silently handle error - keep empty suggested books array
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
      
      if (userRatingRes.success && userRatingRes.data) {
        setUserRating(userRatingRes.data);
      }
      
      if (ratingStatsRes.success && ratingStatsRes.data) {
        setRatingStats(ratingStatsRes.data);
      }
    } catch (e: any) {
      // Silently handle error - use default rating values
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
        try {
          const statsRes = await apiService.getBookRatingStats(book.id);
          if (statsRes.success && statsRes.data) {
            setRatingStats(statsRes.data);
          }
        } catch (e: any) {
          // Silently handle error updating stats
        }
      }
    } catch (e: any) {
      // Silently handle error - rating change may have failed
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
    } catch (e: any) {
      // Silently handle error - comment posting failed
    } finally {
      setPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await apiService.likeComment(commentId);
      if (res.success && res.data) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, hasLiked: res.data?.hasLiked || false, likesCount: res.data?.likesCount || 0 } : c));
      }
    } catch (e: any) {
      // Silently handle error - like action may have failed
    }
  };

  const handleLike = async () => {
    const previousState = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const response = await apiService.likeBook(book.id);
      if (response.success && response.data) {
        setLikeCount(response.data.likesCount);
      }
    } catch (error) {
      setIsLiked(previousState);
      setLikeCount(previousCount);
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadComments();
    loadSuggestedBooks();
    loadRatingData();
  }, [book.id]);

  const toggleWishlist = useCallback(async () => {
    if (wishlistLoading) return;

    const previousState = inWishlist;

    setInWishlist(!inWishlist);
    eventBus.emit('wishlist:toggle', { book, inWishlist: !inWishlist });

    setWishlistLoading(true);
    try {
      const res = await apiService.toggleWishlist(book.id);
      if (!res.success) throw new Error('Failed to toggle wishlist');

      const serverState = (res.data as any)?.inWishlist;
      if (serverState !== undefined) {
        setInWishlist(serverState);
        eventBus.emit('wishlist:toggle', { book, inWishlist: serverState });
      }
    } catch (e: any) {
      setInWishlist(previousState);
      eventBus.emit('wishlist:toggle', { book, inWishlist: previousState });
      console.error('Error toggling wishlist:', e);
    } finally {
      setWishlistLoading(false);
    }
  }, [book.id, inWishlist, wishlistLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sách</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleWishlist} accessibilityLabel="Yêu thích" disabled={wishlistLoading}>
          <Text style={[styles.favoriteButtonText, inWishlist && styles.favorited]}>{inWishlist ? '❤️' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Cover and Basic Info */}
        <View style={styles.bookSection}>
          <Image 
            source={{ 
              uri: book.coverImage || 'https://placehold.co/200x300/CCCCCC/FFFFFF?text=No+Image' 
            }} 
            style={styles.bookCover} 
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{authors}</Text>
            
            {/* Rating - Simplified */}
            <View style={styles.ratingContainer}>
              {ratingLoading ? (
                <View style={styles.ratingLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : (
                <View style={styles.ratingRow}>
                  <StarRating
                    rating={ratingStats?.averageRating || book.rating || 0}
                    size="small"
                    showText={false}
                  />
                  <Text style={styles.reviewsText}>
                    {(typeof ratingStats?.averageRating === 'number' ? ratingStats.averageRating.toFixed(1) : 
                      typeof book.rating === 'number' ? book.rating.toFixed(1) : '0.0')} ({ratingStats?.totalRatings || book.reviewCount || 0} đánh giá)
                  </Text>
                </View>
              )}
            </View>

            {/* Like Button */}
            <TouchableOpacity style={styles.likeBookButton} onPress={handleLike} accessibilityLabel="Thích sách">
              <Text style={[styles.likeBookText, isLiked && styles.likedBook]}>
                {isLiked ? '❤️' : '🤍'} {likeCount}
              </Text>
            </TouchableOpacity>

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

        {/* Rating Section - Combined Layout */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
          
          {/* User Rating Input Only */}
          <View style={styles.userRatingCard}>
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

          {/* Rating Distribution Chart */}
          {ratingStats && ratingStats.totalRatings > 0 && (
            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>Phân bố đánh giá</Text>
              <RatingDistributionChart
                ratingDistribution={ratingStats.ratingDistribution}
                totalRatings={ratingStats.totalRatings}
              />
            </View>
          )}
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
                  onPress={() => {
                    try {
                      router.push(`/book-detail/${suggestedBook.id}`);
                    } catch (e: any) {
                      // Silently handle navigation error
                    }
                  }}
                >
                  <Image 
                    source={{ 
                      uri: suggestedBook.coverImage || 'https://placehold.co/120x160/CCCCCC/FFFFFF?text=No+Image'
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
        {requiresPoints && !isUnlocked ? (
          <>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                Cần {requiredPoints.toLocaleString('vi-VN')} điểm để mở khóa
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.unlockButton, unlockLoading && styles.unlockButtonDisabled]} 
              onPress={handlePurchaseBook}
              disabled={unlockLoading}
            >
              {unlockLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.readButtonText}>
                  Mở khóa ({requiredPoints.toLocaleString('vi-VN')} điểm)
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.readButton} onPress={handleReadBook}>
            <Text style={styles.readButtonText}>Đọc sách</Text>
          </TouchableOpacity>
        )}
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    // removed unused style
  },
  bookAuthor: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  ratingContainer: {
    marginBottom: SIZES.spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    flexWrap: 'wrap',
  },
  ratingText: {
    // removed unused style
  },
  reviewsText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    flexShrink: 1,
    maxWidth: '100%',
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
  userRatingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  userRatingTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  distributionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  distributionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  ratingInputContainer: {
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  ratingStatusText: {
    fontSize: SIZES.font.sm,
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
  likeBookButton: {
    alignSelf: 'flex-start',
    marginTop: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  likeBookText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  likedBook: {
    color: '#e11d48',
    fontWeight: '700',
  },
  priceContainer: {
    // removed unused style
  },
  currentPrice: {
    // removed unused style
  },
  originalPrice: {
    // removed unused style
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
    flexDirection: 'column',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    zIndex: 20,
    elevation: 20,
  },
  pointsBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 8,
  },
  pointsBadgeText: {
    color: '#C2410C',
    fontWeight: '600',
  },
  readButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: '100%',
  },
  readButtonDisabled: {
    // removed unused style
  },
  unlockButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: '100%',
  },
  unlockButtonDisabled: {
    backgroundColor: '#22c55e99',
  },
  readButtonText: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    lineHeight: SIZES.font.lg + 4,
    color: COLORS.white,
    textAlign: 'center',
  },
  purchaseButton: {
    // removed unused style
  },
  purchaseButtonText: {
    // removed unused style
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