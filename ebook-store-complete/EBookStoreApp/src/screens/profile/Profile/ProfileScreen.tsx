import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return 'Chưa cập nhật';
    }
  };

  const handleChangeAvatar = () => {
    setIsAvatarModalVisible(true);
  };

  const handleImagePicker = (source: 'camera' | 'gallery') => {
    // In real app, this would use react-native-image-picker
    // For now, we'll simulate with a placeholder
    const mockImageUri = 'https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=New+Avatar';
    setSelectedImage(mockImageUri);
    setIsAvatarModalVisible(false);
    console.log('Avatar updated:', mockImageUri);
  };

  const handleRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(true);
  };

  const confirmRemoveAvatar = () => {
    setSelectedImage(null);
    console.log('Avatar removed');
    setShowRemoveAvatarConfirm(false);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalVisible(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarWrapper}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.avatar} />
            ) : user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {user.firstName.charAt(0).toUpperCase()}
                  {user.lastName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditButton}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, user.isVerified ? styles.verified : styles.unverified]}>
            <Text style={styles.statusText}>
              {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Họ và tên:</Text>
          <Text style={styles.infoValue}>
            {user.firstName} {user.lastName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>
            {user.phone || 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày sinh:</Text>
          <Text style={styles.infoValue}>
            {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giới tính:</Text>
          <Text style={styles.infoValue}>{getGenderText(user.gender)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoValue}>
            {user.address || 'Chưa cập nhật'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.booksPurchased}</Text>
            <Text style={styles.statLabel}>Sách đã mua</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.totalSpent.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.statLabel}>Tổng chi tiêu</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tham gia từ:</Text>
          <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Đăng nhập cuối:</Text>
          <Text style={styles.infoValue}>
            {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa có'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/profile/edit-profile')}
          >
            <Text style={styles.quickActionEmoji}>✏️</Text>
            <Text style={styles.quickActionTitle}>Chỉnh sửa</Text>
            <Text style={styles.quickActionSubtitle}>Cập nhật thông tin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/profile/change-password')}
          >
            <Text style={styles.quickActionEmoji}>🔒</Text>
            <Text style={styles.quickActionTitle}>Bảo mật</Text>
            <Text style={styles.quickActionSubtitle}>Đổi mật khẩu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => console.log('Settings pressed')}
          >
            <Text style={styles.quickActionEmoji}>⚙️</Text>
            <Text style={styles.quickActionTitle}>Cài đặt</Text>
            <Text style={styles.quickActionSubtitle}>Tùy chỉnh app</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => console.log('Help pressed')}
          >
            <Text style={styles.quickActionEmoji}>❓</Text>
            <Text style={styles.quickActionTitle}>Trợ giúp</Text>
            <Text style={styles.quickActionSubtitle}>Hỗ trợ & FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Tiến độ đọc</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>12</Text>
            <Text style={styles.progressLabel}>Sách đã đọc</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>3,240</Text>
            <Text style={styles.progressLabel}>Trang đã đọc</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>45h</Text>
            <Text style={styles.progressLabel}>Thời gian đọc</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Thành tích</Text>
        <View style={styles.achievementsContainer}>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementEmoji}>📚</Text>
            <Text style={styles.achievementTitle}>Đọc giả mới</Text>
            <Text style={styles.achievementDescription}>Đọc 5 cuốn sách đầu tiên</Text>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementEmoji}>🔥</Text>
            <Text style={styles.achievementTitle}>Streak 7 ngày</Text>
            <Text style={styles.achievementDescription}>Đọc liên tục 7 ngày</Text>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementEmoji}>⭐</Text>
            <Text style={styles.achievementTitle}>Đánh giá viên</Text>
            <Text style={styles.achievementDescription}>Đánh giá 10 cuốn sách</Text>
          </View>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/profile/edit-profile')}
        >
          <Text style={styles.actionButtonText}>✏️ Cập nhật thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/profile/change-password')}
        >
          <Text style={styles.actionButtonText}>🔒 Đổi mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.logoutButton,
            (isLoggingOut || isLoading) && styles.disabledButton
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut || isLoading}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            {isLoggingOut ? '🔄 Đang đăng xuất...' : '🚪 Đăng xuất'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Change Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAvatarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi ảnh đại diện</Text>
              <TouchableOpacity onPress={closeAvatarModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.avatarPreview}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewDefaultAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {user.firstName.charAt(0).toUpperCase()}
                    {user.lastName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cameraButton]}
                onPress={() => handleImagePicker('camera')}
              >
                <Text style={styles.actionButtonIcon}>📷</Text>
                <Text style={styles.actionButtonText}>Chụp ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.galleryButton]}
                onPress={() => handleImagePicker('gallery')}
              >
                <Text style={styles.actionButtonIcon}>🖼️</Text>
                <Text style={styles.actionButtonText}>Chọn từ thư viện</Text>
              </TouchableOpacity>

              {(user.avatar || selectedImage) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={handleRemoveAvatar}
                >
                  <Text style={styles.actionButtonIcon}>🗑️</Text>
                  <Text style={styles.actionButtonText}>Xóa ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        visible={showRemoveAvatarConfirm}
        title="Xóa ảnh đại diện"
        message="Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?"
        confirmText="Xóa"
        cancelText="Hủy"
        destructive
        onConfirm={confirmRemoveAvatar}
        onCancel={() => setShowRemoveAvatarConfirm(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarEditIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  name: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  email: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 15,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  verified: {
    backgroundColor: COLORS.success,
  },
  unverified: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  infoLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    flex: 2,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    marginTop: 5,
  },
  actionsSection: {
    margin: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: SIZES.font.md,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 50,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray50,
  },
  achievementEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Avatar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  previewDefaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  previewAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalActions: {
    gap: 15,
  },
  cameraButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
});

export default ProfileScreen;

