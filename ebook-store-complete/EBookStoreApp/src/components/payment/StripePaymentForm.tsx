import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { stripeService, BookPurchaseData, PaymentResult } from '../../services/stripeService';

interface StripePaymentFormProps {
  bookData: BookPurchaseData;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  bookData,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const handleCardPayment = async () => {
    setLoading(true);
    try {
      // For web, we'll simulate a successful payment
      // In a real app, you would integrate with Stripe.js for web
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      const result: PaymentResult = {
        success: true,
        paymentIntentId: `pi_${Date.now()}`,
      };
      
      onPaymentSuccess(result);
    } catch (error) {
      console.error('Card payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplePay = async () => {
    setLoading(true);
    try {
      // For web, Apple Pay is not available
      if (Platform.OS === 'web') {
        Alert.alert('Thông báo', 'Apple Pay không khả dụng trên web. Vui lòng sử dụng thẻ tín dụng.');
        return;
      }
      
      // Simulate Apple Pay processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: PaymentResult = {
        success: true,
        paymentIntentId: `pi_apple_${Date.now()}`,
      };
      
      onPaymentSuccess(result);
    } catch (error) {
      console.error('Apple Pay error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Apple Pay failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePay = async () => {
    setLoading(true);
    try {
      // For web, Google Pay is not available
      if (Platform.OS === 'web') {
        Alert.alert('Thông báo', 'Google Pay không khả dụng trên web. Vui lòng sử dụng thẻ tín dụng.');
        return;
      }
      
      // Simulate Google Pay processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: PaymentResult = {
        success: true,
        paymentIntentId: `pi_google_${Date.now()}`,
      };
      
      onPaymentSuccess(result);
    } catch (error) {
      console.error('Google Pay error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Google Pay failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentButton = (
    title: string,
    onPress: () => void,
    icon: string,
    isAvailable: boolean = true
  ) => (
    <TouchableOpacity
      style={[
        styles.paymentButton,
        !isAvailable && styles.disabledButton,
        loading && styles.loadingButton,
      ]}
      onPress={onPress}
      disabled={!isAvailable || loading}
    >
      <View style={styles.paymentButtonContent}>
        <Text style={styles.paymentButtonIcon}>{icon}</Text>
        <Text style={[
          styles.paymentButtonText,
          !isAvailable && styles.disabledText,
        ]}>
          {title}
        </Text>
        {loading && <ActivityIndicator size="small" color={COLORS.textInverse} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán qua Stripe</Text>
      <Text style={styles.subtitle}>
        Chọn phương thức thanh toán an toàn và nhanh chóng
      </Text>

      <View style={styles.paymentMethods}>
        {renderPaymentButton(
          'Thẻ tín dụng/ghi nợ',
          handleCardPayment,
          '💳',
          true
        )}
        
        {renderPaymentButton(
          'Apple Pay',
          handleApplePay,
          '🍎',
          Platform.OS !== 'web' // Only available on native platforms
        )}
        
        {renderPaymentButton(
          'Google Pay',
          handleGooglePay,
          '📱',
          Platform.OS !== 'web' // Only available on native platforms
        )}
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Thanh toán được bảo mật bởi Stripe. Thông tin thẻ của bạn được mã hóa và bảo vệ.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    margin: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
    lineHeight: 20,
  },
  paymentMethods: {
    gap: SIZES.spacing.md,
  },
  paymentButton: {
    ...COMMON_STYLES.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray400,
  },
  loadingButton: {
    opacity: 0.7,
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  paymentButtonIcon: {
    fontSize: SIZES.icon.md,
  },
  paymentButtonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
  },
  disabledText: {
    color: COLORS.textLight,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.md,
  },
  securityIcon: {
    fontSize: SIZES.icon.sm,
    marginRight: SIZES.spacing.sm,
  },
  securityText: {
    flex: 1,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default StripePaymentForm;
