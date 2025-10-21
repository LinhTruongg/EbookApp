import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { apiService } from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';
import CommentDeleteDialog from '../../../components/admin/CommentDeleteDialog';

interface Comment {
  id: number;
  content: string;
  isApproved: boolean;
  likesCount: number;
  createdAt: string;
  timeAgo: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  book: {
    id: number;
    title: string;
    coverImage?: string;
  };
  parent?: {
    id: number;
    content: string;
    user: {
      id: number;
      name: string;
    };
  };
  repliesCount: number;
  isReply: boolean;
}

interface CommentStats {
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  totalLikes: number;
  recentComments: number;
}

const ManageCommentsScreen: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadComments();
    loadStats();
  }, [statusFilter, searchQuery]);

  const loadComments = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      
      const response = await apiService.getAllCommentsAdmin({
        page,
        limit: 20,
        status: statusFilter,
        search: searchQuery,
      });

      if (response.success) {
        const newComments = response.data.comments;
        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }
        setCurrentPage(page);
        setHasNextPage(response.data.pagination.hasNextPage);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách bình luận');
      }
    } catch (error) {
      console.error('Load comments error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getAdminCommentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadComments(1), loadStats()]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      loadComments(currentPage + 1, true);
    }
  };

  const handleApproveComment = async (comment: Comment) => {
    try {
      const response = await apiService.updateCommentStatus(comment.id, true);
      if (response.success) {
        Alert.alert('Thành công', 'Duyệt bình luận thành công');
        loadComments(currentPage);
        loadStats();
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể duyệt bình luận');
      }
    } catch (error) {
      console.error('Approve comment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi duyệt bình luận');
    }
  };

  const handleRejectComment = async (comment: Comment) => {
    try {
      const response = await apiService.updateCommentStatus(comment.id, false);
      if (response.success) {
        Alert.alert('Thành công', 'Từ chối bình luận thành công');
        loadComments(currentPage);
        loadStats();
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể từ chối bình luận');
      }
    } catch (error) {
      console.error('Reject comment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi từ chối bình luận');
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await apiService.adminDeleteComment(commentToDelete.id);
      if (response.success) {
        Alert.alert('Thành công', 'Xóa bình luận thành công');
        loadComments(currentPage);
        loadStats();
        setDeleteDialogVisible(false);
        setCommentToDelete(null);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể xóa bình luận');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa bình luận');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteComment = () => {
    setDeleteDialogVisible(false);
    setCommentToDelete(null);
    setDeleteLoading(false);
  };

  const renderStatsCard = (title: string, value: number, icon: string, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsIcon}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {item.user.avatar ? (
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userEmail}>{item.user.email}</Text>
          </View>
        </View>
        <View style={styles.commentMeta}>
          <View style={[
            styles.statusBadge,
            item.isApproved ? styles.approvedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.isApproved ? styles.approvedText : styles.pendingText
            ]}>
              {item.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
            </Text>
          </View>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>

      <View style={styles.commentContent}>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>

      <View style={styles.commentFooter}>
        <View style={styles.bookInfo}>
          <Ionicons name="book" size={16} color={COLORS.textSecondary} />
          <Text style={styles.bookTitle} numberOfLines={1}>
            {item.book.title}
          </Text>
        </View>
        <View style={styles.commentStats}>
          <Ionicons name="heart" size={16} color={COLORS.textSecondary} />
          <Text style={styles.likesCount}>{item.likesCount}</Text>
          {item.repliesCount > 0 && (
            <>
              <Ionicons name="chatbubble" size={16} color={COLORS.textSecondary} />
              <Text style={styles.repliesCount}>{item.repliesCount}</Text>
            </>
          )}
        </View>
      </View>

      {item.parent && (
        <View style={styles.parentComment}>
          <Text style={styles.parentLabel}>Trả lời:</Text>
          <Text style={styles.parentContent} numberOfLines={2}>
            {item.parent.user.name}: {item.parent.content}
          </Text>
        </View>
      )}

      <View style={styles.commentActions}>
        {!item.isApproved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveComment(item)}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Duyệt</Text>
          </TouchableOpacity>
        )}
        {item.isApproved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectComment(item)}
          >
            <Ionicons name="close" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            setSelectedComment(item);
            setModalVisible(true);
          }}
        >
          <Ionicons name="eye" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteComment(item)}
        >
          <Ionicons name="trash" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && comments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách bình luận...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          {renderStatsCard('Tổng bình luận', stats.totalComments, 'chatbubbles', COLORS.primary)}
          {renderStatsCard('Đã duyệt', stats.approvedComments, 'checkmark-circle', COLORS.success)}
          {renderStatsCard('Chờ duyệt', stats.pendingComments, 'time', COLORS.warning)}
          {renderStatsCard('Tổng lượt thích', stats.totalLikes, 'heart', COLORS.error)}
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bình luận..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statusFilters}>
          {(['all', 'approved', 'pending'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'Tất cả' : status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.commentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
            <Text style={styles.emptySubtext}>Bình luận sẽ xuất hiện ở đây khi người dùng bình luận</Text>
          </View>
        }
      />

      {/* Comment Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết bình luận</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedComment && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Người bình luận</Text>
                <View style={styles.detailUser}>
                  <View style={styles.avatarContainer}>
                    {selectedComment.user.avatar ? (
                      <Image source={{ uri: selectedComment.user.avatar }} style={styles.avatar} />
                    ) : (
                      <Ionicons name="person" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.detailUserName}>{selectedComment.user.name}</Text>
                    <Text style={styles.detailUserEmail}>{selectedComment.user.email}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Sách</Text>
                <Text style={styles.detailBookTitle}>{selectedComment.book.title}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Nội dung bình luận</Text>
                <Text style={styles.detailContent}>{selectedComment.content}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Thông tin</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Trạng thái: </Text>
                    <Text style={[
                      styles.detailInfoValue,
                      selectedComment.isApproved ? styles.approvedText : styles.pendingText
                    ]}>
                      {selectedComment.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Text>
                  </Text>
                  <Text style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Lượt thích: </Text>
                    <Text style={styles.detailInfoValue}>{selectedComment.likesCount}</Text>
                  </Text>
                  <Text style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Số phản hồi: </Text>
                    <Text style={styles.detailInfoValue}>{selectedComment.repliesCount}</Text>
                  </Text>
                  <Text style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Thời gian: </Text>
                    <Text style={styles.detailInfoValue}>{selectedComment.timeAgo}</Text>
                  </Text>
                </View>
              </View>

              {selectedComment.parent && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Bình luận gốc</Text>
                  <View style={styles.parentDetail}>
                    <Text style={styles.parentDetailUser}>
                      {selectedComment.parent.user.name}:
                    </Text>
                    <Text style={styles.parentDetailContent}>
                      {selectedComment.parent.content}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                {!selectedComment.isApproved && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.approveButton]}
                    onPress={() => {
                      handleApproveComment(selectedComment);
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                    <Text style={styles.modalActionButtonText}>Duyệt bình luận</Text>
                  </TouchableOpacity>
                )}
                {selectedComment.isApproved && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.rejectButton]}
                    onPress={() => {
                      handleRejectComment(selectedComment);
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="close" size={20} color={COLORS.white} />
                    <Text style={styles.modalActionButtonText}>Từ chối bình luận</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.deleteButton]}
                  onPress={() => {
                    setModalVisible(false);
                    handleDeleteComment(selectedComment);
                  }}
                >
                  <Ionicons name="trash" size={20} color={COLORS.white} />
                  <Text style={styles.modalActionButtonText}>Xóa bình luận</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <CommentDeleteDialog
        visible={deleteDialogVisible}
        comment={commentToDelete}
        loading={deleteLoading}
        onConfirm={confirmDeleteComment}
        onCancel={cancelDeleteComment}
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
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: SIZES.spacing.sm,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsTitle: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    paddingLeft: SIZES.spacing.sm,
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  commentsList: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  commentItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  commentMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.sm,
    marginBottom: 4,
  },
  approvedBadge: {
    backgroundColor: COLORS.success + '20',
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
  },
  statusText: {
    fontSize: SIZES.font.xs,
    fontWeight: '600',
  },
  approvedText: {
    color: COLORS.success,
  },
  pendingText: {
    color: COLORS.warning,
  },
  timeAgo: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  commentContent: {
    marginBottom: SIZES.spacing.sm,
  },
  commentText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookTitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.xs,
    flex: 1,
  },
  commentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  likesCount: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  repliesCount: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  parentComment: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  parentLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentContent: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  commentActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.sm,
    gap: 4,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.warning,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  emptyText: {
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  emptySubtext: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: SIZES.spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  detailSection: {
    marginBottom: SIZES.spacing.lg,
  },
  detailLabel: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  detailUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailUserName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  detailUserEmail: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  detailBookTitle: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  detailContent: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 22,
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  detailInfo: {
    gap: SIZES.spacing.xs,
  },
  detailInfoItem: {
    fontSize: SIZES.font.sm,
  },
  detailInfoLabel: {
    color: COLORS.textSecondary,
  },
  detailInfoValue: {
    color: COLORS.text,
    fontWeight: '500',
  },
  parentDetail: {
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
  },
  parentDetailUser: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs,
  },
  parentDetailContent: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  modalActions: {
    gap: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    gap: SIZES.spacing.sm,
  },
  modalActionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
});

export default ManageCommentsScreen;


