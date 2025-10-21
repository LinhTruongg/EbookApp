import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';
import AdvancedConfirmDialog from '../common/AdvancedConfirmDialog';

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

interface CommentStatusDialogProps {
  visible: boolean;
  comment: Comment | null;
  action: 'approve' | 'reject';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CommentStatusDialog: React.FC<CommentStatusDialogProps> = ({
  visible,
  comment,
  action,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!comment) return null;

  const isApprove = action === 'approve';
  const title = isApprove ? 'Duyệt bình luận' : 'Từ chối bình luận';
  const confirmText = isApprove ? 'Duyệt' : 'Từ chối';
  const type = isApprove ? 'success' : 'warning';
  const customIcon = isApprove ? 'checkmark-circle' : 'close-circle';

  const getActionMessage = () => {
    if (isApprove) {
      return 'Bình luận này sẽ được hiển thị công khai và người dùng có thể thấy nó.';
    } else {
      return 'Bình luận này sẽ bị ẩn khỏi công chúng và người dùng không thể thấy nó.';
    }
  };

  const customContent = (
    <View style={styles.content}>
      {/* Action Message */}
      <View style={[
        styles.messageBox,
        {
          backgroundColor: isApprove ? COLORS.success + '20' : COLORS.warning + '20',
          borderColor: isApprove ? COLORS.success + '40' : COLORS.warning + '40',
        }
      ]}>
        <Ionicons 
          name={isApprove ? 'checkmark-circle' : 'alert-circle'} 
          size={20} 
          color={isApprove ? COLORS.success : COLORS.warning} 
        />
        <Text style={[
          styles.messageText,
          { color: isApprove ? COLORS.success : COLORS.warning }
        ]}>
          {getActionMessage()}
        </Text>
      </View>

      {/* Comment Preview */}
      <View style={styles.commentPreview}>
        <Text style={styles.previewLabel}>Bình luận:</Text>
        
        <View style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {comment.user.avatar ? (
                  <Text style={styles.avatarText}>
                    {comment.user.name.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <Ionicons name="person" size={16} color={COLORS.primary} />
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{comment.user.name}</Text>
                <Text style={styles.userEmail}>{comment.user.email}</Text>
              </View>
            </View>
            <View style={styles.commentMeta}>
              <View style={[
                styles.statusBadge,
                comment.isApproved ? styles.approvedBadge : styles.pendingBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  comment.isApproved ? styles.approvedText : styles.pendingText
                ]}>
                  {comment.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                </Text>
              </View>
              <Text style={styles.timeAgo}>{comment.timeAgo}</Text>
            </View>
          </View>

          <View style={styles.commentContent}>
            <Text style={styles.commentText} numberOfLines={3}>
              {comment.content}
            </Text>
          </View>

          <View style={styles.commentFooter}>
            <View style={styles.bookInfo}>
              <Ionicons name="book" size={14} color={COLORS.textSecondary} />
              <Text style={styles.bookTitle} numberOfLines={1}>
                {comment.book.title}
              </Text>
            </View>
            <View style={styles.commentStats}>
              <Ionicons name="heart" size={14} color={COLORS.textSecondary} />
              <Text style={styles.likesCount}>{comment.likesCount}</Text>
              {comment.repliesCount > 0 && (
                <>
                  <Ionicons name="chatbubble" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.repliesCount}>{comment.repliesCount}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Impact Information */}
      <View style={styles.impactInfo}>
        <Text style={styles.impactTitle}>Tác động:</Text>
        <View style={styles.impactList}>
          <View style={styles.impactItem}>
            <Ionicons 
              name={isApprove ? 'eye' : 'eye-off'} 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.impactText}>
              {isApprove 
                ? 'Bình luận sẽ hiển thị công khai' 
                : 'Bình luận sẽ bị ẩn khỏi công chúng'
              }
            </Text>
          </View>
          {comment.repliesCount > 0 && (
            <View style={styles.impactItem}>
              <Ionicons name="chatbubbles" size={16} color={COLORS.textSecondary} />
              <Text style={styles.impactText}>
                {isApprove 
                  ? `${comment.repliesCount} phản hồi sẽ hiển thị` 
                  : `${comment.repliesCount} phản hồi sẽ bị ẩn`
                }
              </Text>
            </View>
          )}
          <View style={styles.impactItem}>
            <Ionicons name="heart" size={16} color={COLORS.textSecondary} />
            <Text style={styles.impactText}>
              {comment.likesCount} lượt thích sẽ {isApprove ? 'hiển thị' : 'bị ẩn'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <AdvancedConfirmDialog
      visible={visible}
      title={title}
      type={type}
      customIcon={customIcon}
      customContent={customContent}
      confirmText={confirmText}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
      destructive={!isApprove}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    gap: SIZES.spacing.lg,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    gap: SIZES.spacing.sm,
  },
  messageText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  commentPreview: {
    // Styles tương tự như trong CommentDeleteDialog
  },
  previewLabel: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  commentCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
  },
  avatarText: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.font.sm,
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
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: 2,
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
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookTitle: {
    fontSize: SIZES.font.xs,
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
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  repliesCount: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  impactInfo: {
    // Styles tương tự như trong CommentDeleteDialog
  },
  impactTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  impactList: {
    gap: SIZES.spacing.sm,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  impactText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
});

export default CommentStatusDialog;
