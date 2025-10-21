import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';
import CommentDeleteDialog from './CommentDeleteDialog';
import CommentStatusDialog from './CommentStatusDialog';
import AdvancedConfirmDialog from '../common/AdvancedConfirmDialog';

// Mock data for demonstration
const mockComment = {
  id: 1,
  content: 'Cuốn sách này rất hay! Tôi đã đọc và thấy rất hữu ích. Tác giả viết rất chi tiết và dễ hiểu.',
  isApproved: false,
  likesCount: 15,
  createdAt: '2024-01-15T10:30:00Z',
  timeAgo: '2 giờ trước',
  user: {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatar: null,
  },
  book: {
    id: 1,
    title: 'Lập trình React Native từ cơ bản đến nâng cao',
    coverImage: null,
  },
  parent: {
    id: 2,
    content: 'Cảm ơn bạn đã chia sẻ!',
    user: {
      id: 2,
      name: 'Trần Thị B',
    },
  },
  repliesCount: 3,
  isReply: true,
};

const DialogExamples: React.FC = () => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [approveDialogVisible, setApproveDialogVisible] = useState(false);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [simpleDialogVisible, setSimpleDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setDeleteDialogVisible(false);
    console.log('Comment deleted');
  };

  const handleApprove = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setApproveDialogVisible(false);
    console.log('Comment approved');
  };

  const handleReject = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setRejectDialogVisible(false);
    console.log('Comment rejected');
  };

  const handleSimpleConfirm = () => {
    setSimpleDialogVisible(false);
    console.log('Simple action confirmed');
  };

  const renderExampleButton = (
    title: string,
    description: string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.exampleButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.buttonContent}>
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dialog Components Demo</Text>
        <Text style={styles.subtitle}>Các component dialog cho admin</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment Management Dialogs</Text>
          
          {renderExampleButton(
            'Xóa bình luận',
            'Dialog xác nhận xóa với thông tin chi tiết',
            'trash',
            COLORS.error,
            () => setDeleteDialogVisible(true)
          )}

          {renderExampleButton(
            'Duyệt bình luận',
            'Dialog xác nhận duyệt bình luận',
            'checkmark-circle',
            COLORS.success,
            () => setApproveDialogVisible(true)
          )}

          {renderExampleButton(
            'Từ chối bình luận',
            'Dialog xác nhận từ chối bình luận',
            'close-circle',
            COLORS.warning,
            () => setRejectDialogVisible(true)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Purpose Dialogs</Text>
          
          {renderExampleButton(
            'Dialog đơn giản',
            'AdvancedConfirmDialog với nội dung tùy chỉnh',
            'information-circle',
            COLORS.primary,
            () => setSimpleDialogVisible(true)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Hiển thị thông tin chi tiết bình luận</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Cảnh báo tác động khi xóa</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Loading state khi xử lý</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Responsive design</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Customizable icons và colors</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Scrollable content</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Dialog */}
      <CommentDeleteDialog
        visible={deleteDialogVisible}
        comment={mockComment}
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      />

      {/* Approve Dialog */}
      <CommentStatusDialog
        visible={approveDialogVisible}
        comment={mockComment}
        action="approve"
        loading={loading}
        onConfirm={handleApprove}
        onCancel={() => setApproveDialogVisible(false)}
      />

      {/* Reject Dialog */}
      <CommentStatusDialog
        visible={rejectDialogVisible}
        comment={mockComment}
        action="reject"
        loading={loading}
        onConfirm={handleReject}
        onCancel={() => setRejectDialogVisible(false)}
      />

      {/* Simple Dialog */}
      <AdvancedConfirmDialog
        visible={simpleDialogVisible}
        title="Xác nhận hành động"
        message="Bạn có chắc chắn muốn thực hiện hành động này không?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="info"
        onConfirm={handleSimpleConfirm}
        onCancel={() => setSimpleDialogVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.md,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  buttonDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  featureList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
    gap: SIZES.spacing.sm,
  },
  featureText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    flex: 1,
  },
});

export default DialogExamples;
