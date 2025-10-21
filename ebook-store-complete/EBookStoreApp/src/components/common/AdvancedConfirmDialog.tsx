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

interface AdvancedConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  showIcon?: boolean;
  customIcon?: keyof typeof Ionicons.glyphMap;
  customContent?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

const { width } = Dimensions.get('window');

const AdvancedConfirmDialog: React.FC<AdvancedConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  loading = false,
  showIcon = true,
  customIcon,
  customContent,
  onConfirm,
  onCancel,
  destructive = true,
}) => {
  const getIconAndColor = () => {
    if (customIcon) {
      return {
        icon: customIcon,
        color: destructive ? '#EF4444' : COLORS.primary,
        backgroundColor: destructive ? '#FEF2F2' : '#EFF6FF',
        borderColor: destructive ? '#FECACA' : '#BFDBFE',
      };
    }

    switch (type) {
      case 'danger':
        return {
          icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
      case 'info':
        return {
          icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
          color: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
      default:
        return {
          icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
    }
  };

  const { icon, color, backgroundColor, borderColor } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={[styles.dialog, { borderColor }]}>
            {/* Header */}
            <View style={styles.header}>
              {showIcon && (
                <View style={[styles.iconContainer, { backgroundColor }]}>
                  <Ionicons name={icon} size={32} color={color} />
                </View>
              )}
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {customContent ? (
                customContent
              ) : (
                message && (
                  <Text style={styles.message}>{message}</Text>
                )
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: color },
                  loading && styles.disabledButton
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass" size={16} color={COLORS.white} />
                    <Text style={styles.confirmButtonText}>Đang xử lý...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
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
    maxWidth: 400,
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
    maxHeight: 300,
    paddingHorizontal: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
  },
  message: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  confirmButton: {
    // backgroundColor sẽ được set động
  },
  disabledButton: {
    opacity: 0.6,
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
  confirmButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AdvancedConfirmDialog;
