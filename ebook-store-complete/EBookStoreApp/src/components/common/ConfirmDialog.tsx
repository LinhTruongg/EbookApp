import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Hủy',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}> 
              <Text style={[styles.buttonText, styles.cancelText]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, destructive ? styles.destructiveButton : styles.confirmButton]}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  message: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.gray50,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelText: {
    color: COLORS.text,
  },
  confirmText: {
    color: COLORS.white,
  },
});


