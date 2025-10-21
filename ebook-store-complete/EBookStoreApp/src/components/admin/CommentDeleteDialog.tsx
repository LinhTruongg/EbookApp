import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';

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

interface CommentDeleteDialogProps {
  visible: boolean;
  comment: Comment | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');

const CommentDeleteDialog: React.FC<CommentDeleteDialogProps> = ({
  visible,
  comment,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!comment) return null;

  const getWarningMessage = () => {
    if (comment.repliesCount > 0) {
      return `Bình luận này có ${comment.repliesCount} phản hồi. Việc xóa sẽ xóa tất cả phản hồi liên quan.`;
    }
    return 'Bình luận này sẽ bị xóa vĩnh viễn và không thể khôi phục.';
  };

  const getImpactLevel = () => {
    if (comment.repliesCount > 0) {
      return {
        level: 'high',
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
      };
    }
    return {
      level: 'medium',
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
      borderColor: '#FECACA',
      icon: 'trash' as keyof typeof Ionicons.glyphMap,
    };
  };

  const impact = getImpactLevel();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={[styles.dialog, { borderColor: impact.borderColor }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: impact.backgroundColor }]}>
                <Ionicons name={impact.icon} size={32} color={impact.color} />
              </View>
              <Text style={styles.title}>Xóa bình luận</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Warning Message */}
              <View style={[styles.warningBox, { backgroundColor: impact.backgroundColor, borderColor: impact.borderColor }]}>
                <Ionicons name="alert-circle" size={20} color={impact.color} />
                <Text style={[styles.warningText, { color: impact.color }]}>
                  {getWarningMessage()}
                </Text>
              </View>

              {/* Comment Preview */}
              <View style={styles.commentPreview}>
                <Text style={styles.previewLabel}>Bình luận sẽ bị xóa:</Text>
                
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
                    <Text style={styles.commentText} numberOfLines={4}>
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

                  {comment.parent && (
                    <View style={styles.parentComment}>
                      <Text style={styles.parentLabel}>Trả lời:</Text>
                      <Text style={styles.parentContent} numberOfLines={2}>
                        {comment.parent.user.name}: {comment.parent.content}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Impact Information */}
              <View style={styles.impactInfo}>
                <Text style={styles.impactTitle}>Tác động của việc xóa:</Text>
                <View style={styles.impactList}>
                  <View style={styles.impactItem}>
                    <Ionicons name="trash" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.impactText}>Bình luận sẽ bị xóa vĩnh viễn</Text>
                  </View>
                  {comment.repliesCount > 0 && (
                    <View style={styles.impactItem}>
                      <Ionicons name="chatbubbles" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.impactText}>
                        {comment.repliesCount} phản hồi sẽ bị xóa
                      </Text>
                    </View>
                  )}
                  <View style={styles.impactItem}>
                    <Ionicons name="heart" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.impactText}>
                      {comment.likesCount} lượt thích sẽ bị mất
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Ionicons name="warning" size={16} color={COLORS.warning} />
                    <Text style={styles.impactText}>Không thể khôi phục sau khi xóa</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.deleteButton,
                  { backgroundColor: impact.color },
                  loading && styles.disabledButton
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass" size={16} color={COLORS.white} />
                    <Text style={styles.deleteButtonText}>Đang xóa...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="trash" size={16} color={COLORS.white} />
                    <Text style={styles.deleteButtonText}>Xóa bình luận</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: SIZES.spacing.xl,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  commentPreview: {
    marginBottom: SIZES.spacing.lg,
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
    marginBottom: SIZES.spacing.sm,
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
  parentComment: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.sm,
    padding: SIZES.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  parentLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentContent: {
    fontSize: SIZES.font.xs,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  impactInfo: {
    marginBottom: SIZES.spacing.lg,
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
  actions: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteButton: {
    // backgroundColor sẽ được set động
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  cancelButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CommentDeleteDialog;
