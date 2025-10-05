import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Alert, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../../constants/index';
import { useAuth } from '../../../context/AuthContext';
import { CloudinaryService } from '../../../services/cloudinaryService';
import { apiService } from '../../../services/api';
import { Book, BookDetailResponse, Comment, CommentStats } from '../../../types';

interface BookDetailScreenProps {
  route: {
    params: {
      book: Book;
    };
  };
  navigation: any;
}

export default function BookDetailScreen({ route, navigation }: BookDetailScreenProps) {
  const { book: initialBook } = route.params;
  const { user } = useAuth();

  // Ensure we have a valid book object with default values
  const defaultBook: Book = {
    id: '',
    title: '',
    description: '',
    isbn: '',
    price: 0,
    pageCount: 0,
    language: 'vi',
    publishedDate: '',
    publisher: '',
    isActive: true,
    isFeatured: false,
    downloadCount: 0,
    viewCount: 0,
    rating: 0,
    reviewCount: 0,
    createdAt: '',
    updatedAt: '',
  };

  const [book, setBook] = useState<Book>(initialBook || defaultBook);
  const [userInfo, setUserInfo] = useState<BookDetailResponse['userInfo'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentStats, setCommentStats] = useState<CommentStats | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  useEffect(() => {
    loadBookData();
  }, []);

  const loadBookData = async () => {
    try {
      setIsLoading(true);
      
      // Only fetch if we have a valid book ID
      if (book.id) {
        // Fetch detailed book information
        const bookResponse = await apiService.getBookById(book.id);
        if (bookResponse.success && bookResponse.data) {
          if (bookResponse.data.book) {
            setBook(bookResponse.data.book);
          }
          if (bookResponse.data.userInfo) {
            setUserInfo(bookResponse.data.userInfo);
          }
        }
      }

      // Fetch related books (same category)
      if (book.categories && book.categories.length > 0) {
        const relatedResponse = await apiService.getBooksByCategory(book.categories[0].id);
        if (relatedResponse.success && relatedResponse.data) {
          // Filter out current book and get up to 4 related books
          const filtered = relatedResponse.data.filter((b: Book) => b.id !== book.id).slice(0, 4);
          setRelatedBooks(filtered);
        }
      }

      // Fetch comments
      if (book.id) {
        const commentsResponse = await apiService.getBookComments(book.id);
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data.comments);
        }

        // Fetch comment stats
        const statsResponse = await apiService.getCommentStats(book.id);
        if (statsResponse.success && statsResponse.data) {
          setCommentStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading book data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sách');
    } finally {
      setIsLoading(false);
    }
  };

  const addToReadingList = (book: Book) => {
    // TODO: Implement API call to add book to reading list
    Alert.alert('Thành công', `Đã thêm "${book.title}" vào danh sách đang đọc`);
  };

  const renderRelatedBook = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.relatedBookItem}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Image 
        source={{ uri: item.coverImage || 'https://via.placeholder.com/80x120/CCCCCC/FFFFFF?text=No+Image' }} 
        style={styles.relatedBookCover} 
      />
    </TouchableOpacity>
  );

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || !user || !book.id) return;

    try {
      setIsSubmittingComment(true);
      const response = await apiService.createComment(book.id, { content });
      
      if (response.success && response.data) {
        setComments([response.data, ...comments]);
        setNewComment('');
        
        // Update comment stats
        if (commentStats) {
          setCommentStats({
            ...commentStats,
            totalComments: commentStats.totalComments + 1
          });
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể thêm bình luận');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Lỗi', 'Không thể thêm bình luận');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await apiService.likeComment(commentId);
      if (response.success && response.data) {
        // Update the comment in the list
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likesCount: response.data!.likesCount, hasLiked: response.data!.hasLiked }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
      Alert.alert('Lỗi', 'Không thể thích/bỏ thích bình luận');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteComment(commentId);
              if (response.success) {
                setComments(comments.filter(comment => comment.id !== commentId));
                
                // Update comment stats
                if (commentStats) {
                  setCommentStats({
                    ...commentStats,
                    totalComments: commentStats.totalComments - 1
                  });
                }
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xóa bình luận');
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Lỗi', 'Không thể xóa bình luận');
            }
          }
        }
      ]
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const initials = item.user.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    
    const isCurrentUserComment = user && item.user.id === user.id.toString();
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{initials}</Text>
        </View>
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>{item.user.name}</Text>
            <Text style={styles.commentTime}>{item.timeAgo}</Text>
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
          
          {/* Comment Actions */}
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.commentActionButton}
              onPress={() => handleLikeComment(item.id)}
            >
              <Text style={styles.commentActionText}>
                {item.hasLiked ? '❤️' : '🤍'} {item.likesCount}
              </Text>
            </TouchableOpacity>
            
            {isCurrentUserComment && (
              <TouchableOpacity 
                style={styles.commentActionButton}
                onPress={() => handleDeleteComment(item.id)}
              >
                <Text style={styles.commentActionText}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Replies */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map((reply) => (
                <View key={reply.id} style={styles.replyItem}>
                  <View style={styles.replyAvatar}>
                    <Text style={styles.replyAvatarText}>
                      {reply.user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.replyBody}>
                    <View style={styles.replyHeader}>
                      <Text style={styles.replyUser}>{reply.user.name}</Text>
                      <Text style={styles.replyTime}>{reply.timeAgo}</Text>
                    </View>
                    <Text style={styles.replyContent}>{reply.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity 
                        style={styles.commentActionButton}
                        onPress={() => handleLikeComment(reply.id)}
                      >
                        <Text style={styles.commentActionText}>
                          {reply.hasLiked ? '❤️' : '🤍'} {reply.likesCount}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin sách...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Pink Background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{book.title || 'Loading...'}</Text>
          <Text style={styles.headerWatermark}>{(book.title || 'BOOK').toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Info Section */}
        <View style={styles.bookInfoSection}>
          <View style={styles.bookCoverContainer}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.bookCoverImage} />
            ) : (
              <View style={styles.bookCover}>
                <Text style={styles.coverAuthor}>
                  {book.authors && book.authors.length > 0 ? book.authors[0].name?.toUpperCase() || 'UNKNOWN AUTHOR' : 'UNKNOWN AUTHOR'}
                </Text>
                <Text style={styles.coverTitle}>{(book.title || 'UNKNOWN TITLE').toUpperCase()}</Text>
                <Text style={styles.coverSubtitle}>{book.description?.substring(0, 50) || 'No description available'}...</Text>
                <Text style={styles.coverDescription}>
                  {book.description?.substring(0, 100) || 'No description available'}...
                </Text>
                {book.isFeatured && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.badgeText}>FEATURED</Text>
                  </View>
                )}
                <Text style={styles.coverPublisher}>{book.publisher?.toUpperCase() || 'UNKNOWN PUBLISHER'}</Text>
              </View>
            )}
          </View>

          <View style={styles.bookDetailsContainer}>
            <Text style={styles.bookTitle}>{book.title || 'Loading...'}</Text>
            <Text style={styles.bookAuthor}>
              {book.authors && book.authors.length > 0 
                ? book.authors.map(author => author.name || 'Unknown').join(', ')
                : 'Unknown Author'
              }
            </Text>
            
            {/* User Status Indicators */}
            {userInfo && (
              <View style={styles.userStatusContainer}>
                {userInfo.isOwned && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✅ Đã sở hữu</Text>
                  </View>
                )}
                {userInfo.isInWishlist && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>❤️ Yêu thích</Text>
                  </View>
                )}
                {userInfo.readingProgress > 0 && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>📖 {Math.round(userInfo.readingProgress * 100)}% đã đọc</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Price Display */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.priceValue}>{(book.price || 0).toLocaleString('vi-VN')}đ</Text>
              {book.discountPrice && book.discountPrice < (book.price || 0) && (
                <Text style={styles.originalPrice}>{(book.price || 0).toLocaleString('vi-VN')}đ</Text>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              {userInfo?.isOwned ? (
                <TouchableOpacity 
                  style={styles.readNowButton}
                  onPress={() => {
                    navigation.navigate('BookReader', {
                      book: {
                        ...book,
                        downloadableUrl: book.downloadableUrl || book.fileUrl
                      }
                    });
                  }}
                >
                  <Text style={styles.readNowButtonText}>📖 ĐỌC NGAY</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.readNowButton}
                  onPress={() => {
                    // Add to "đang đọc" and navigate to reader
                    addToReadingList(book);
                    navigation.navigate('BookReader', {
                      book: {
                        ...book,
                        downloadableUrl: book.downloadableUrl || book.fileUrl
                      }
                    });
                  }}
                >
                  <Text style={styles.readNowButtonText}>📖 ĐỌC NGAY</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => {
                  navigation.navigate('PaymentMethod', {
                    book: {
                      id: book.id || '',
                      title: book.title || 'Unknown Book',
                      author: book.authors && book.authors.length > 0 ? book.authors[0].name || 'Unknown' : 'Unknown',
                      price: book.price || 0,
                      originalPrice: book.discountPrice && book.discountPrice < (book.price || 0) ? book.price : undefined,
                      coverImage: book.coverImage,
                    }
                  });
                }}
              >
                <Text style={styles.buyButtonText}>MUA SÁCH</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Engagement Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>⭐</Text>
            <Text style={styles.metricValue}>{book.rating || 0}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>👁️</Text>
            <Text style={styles.metricValue}>{book.viewCount || 0}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>📥</Text>
            <Text style={styles.metricValue}>{book.downloadCount || 0}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>💬</Text>
            <Text style={styles.metricValue}>{commentStats?.totalComments || 0}</Text>
          </View>
        </View>

        {/* Book Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.descriptionText}>
            {book.description || 'Chưa có mô tả cho cuốn sách này.'}
          </Text>
          {book.description && book.description.length > 200 && (
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>Xem thêm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Bình luận ({commentStats?.totalComments || 0})</Text>
          {user ? (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                placeholderTextColor={COLORS.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                editable={!isSubmittingComment}
              />
              <TouchableOpacity 
                style={[styles.sendButton, (!newComment.trim() || isSubmittingComment) && styles.sendButtonDisabled]} 
                onPress={handleAddComment} 
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.sendButtonText}>Gửi</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Đăng nhập để bình luận</Text>
            </View>
          )}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            scrollEnabled={false}
            contentContainerStyle={styles.commentsList}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsText}>Chưa có bình luận nào</Text>
              </View>
            }
          />
        </View>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <View style={styles.relatedBooksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Có thể bạn quan tâm</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Tất cả {'>'}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={relatedBooks}
              renderItem={renderRelatedBook}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedBooksList}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: '#FFE4E1',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    zIndex: 2,
  },
  headerWatermark: {
    position: 'absolute',
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFB6C1',
    opacity: 0.3,
    zIndex: 1,
    top: -20,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  bookInfoSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  bookCoverContainer: {
    marginRight: 20,
  },
  bookCover: {
    width: 120,
    height: 180,
    backgroundColor: '#E53E3E',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  coverAuthor: {
    fontSize: 8,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  coverSubtitle: {
    fontSize: 6,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverDescription: {
    fontSize: 5,
    color: COLORS.white,
    textAlign: 'left',
    marginBottom: 8,
  },
  coverBadge: {
    backgroundColor: '#C53030',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 4,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coverPublisher: {
    fontSize: 5,
    color: COLORS.white,
    textAlign: 'center',
  },
  bookDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  priceValue: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  buttonContainer: {
    gap: 12,
  },
  readNowButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  readNowButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: SIZES.font.sm,
    color: '#E53E3E',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    padding: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 2,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray50,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.font.sm,
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentTime: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  commentContent: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  relatedBooksSection: {
    backgroundColor: COLORS.white,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: SIZES.font.sm,
    color: '#E53E3E',
    fontWeight: '500',
  },
  relatedBooksList: {
    paddingRight: 20,
  },
  relatedBookItem: {
    marginRight: 12,
  },
  relatedBookCover: {
    width: 80,
    height: 120,
    borderRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  bookCoverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  userStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  loginPrompt: {
    backgroundColor: COLORS.gray50,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  loginPromptText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  emptyComments: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  commentActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  commentActionText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gray50,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  replyBody: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  replyUser: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  replyTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  replyContent: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
});
