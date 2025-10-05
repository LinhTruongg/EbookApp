import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { STRIPE_CONFIG } from '../../config/stripe';
import StripePaymentForm from '../../components/payment/StripePaymentForm';
import { stripeService, BookPurchaseData, PaymentResult } from '../../services/stripeService';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  isAvailable: boolean;
}

interface PaymentMethodScreenProps {
  route: {
    params: {
      book: {
        id: string;
        title: string;
        author: string;
        price: string;
        originalPrice?: string;
        coverImage: string;
      };
    };
  };
  navigation: any;
}

const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({ route, navigation }) => {
  const { book } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Stripe Payment',
      description: 'Thẻ tín dụng, Apple Pay, Google Pay',
      icon: '💳',
      isAvailable: true,
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán nhanh chóng và an toàn',
      icon: '💜',
      isAvailable: true,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán qua ZaloPay',
      icon: '💙',
      isAvailable: true,
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua VNPay',
      icon: '💚',
      isAvailable: true,
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua ngân hàng',
      icon: '🏦',
      isAvailable: true,
    },
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      description: 'COD - Chỉ áp dụng cho sách bản cứng',
      icon: '📦',
      isAvailable: false,
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinuePayment = () => {
    if (!selectedMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    const selectedPayment = paymentMethods.find(method => method.id === selectedMethod);
    
    if (selectedMethod === 'stripe') {
      // For Stripe payments, we'll show the Stripe form instead of confirmation
      return;
    }
    
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn đã chọn thanh toán qua ${selectedPayment?.name} cho cuốn sách "${book.title}" với giá ${book.price}. Bạn có muốn tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thanh toán', 
          onPress: () => {
            handleAlternativePayment(selectedMethod);
          }
        },
      ]
    );
  };

  const handleAlternativePayment = async (methodId: string) => {
    try {
      const bookData: BookPurchaseData = {
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        price: parseInt(book.price.replace(/[^\d]/g, '')), // Extract number from price string
        currency: 'vnd',
        customerEmail: 'customer@example.com', // You can get this from user context
        customerName: 'Customer', // You can get this from user context
      };

      const result = await stripeService.processAlternativePayment(
        methodId as any,
        bookData,
        { method: methodId }
      );

      if (result.success) {
        Alert.alert(
          'Thanh toán thành công!',
          'Cảm ơn bạn đã mua sách. Sách đã được thêm vào thư viện của bạn.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Tabs')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi thanh toán', result.error || 'Thanh toán thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán');
    }
  };

  const handleStripePaymentSuccess = (result: PaymentResult) => {
    Alert.alert(
      'Thanh toán thành công!',
      'Cảm ơn bạn đã mua sách. Sách đã được thêm vào thư viện của bạn.',
      [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('Tabs')
        }
      ]
    );
  };

  const handleStripePaymentError = (error: string) => {
    Alert.alert('Lỗi thanh toán', error);
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod === method.id && styles.selectedPaymentMethod,
        !method.isAvailable && styles.disabledPaymentMethod,
      ]}
      onPress={() => method.isAvailable && handlePaymentMethodSelect(method.id)}
      disabled={!method.isAvailable}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodLeft}>
          <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
          <View style={styles.paymentMethodInfo}>
            <Text style={[
              styles.paymentMethodName,
              !method.isAvailable && styles.disabledText
            ]}>
              {method.name}
            </Text>
            <Text style={[
              styles.paymentMethodDescription,
              !method.isAvailable && styles.disabledText
            ]}>
              {method.description}
            </Text>
          </View>
        </View>
        <View style={styles.paymentMethodRight}>
          {selectedMethod === method.id && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
          {!method.isAvailable && (
            <Text style={styles.unavailableText}>Sắp có</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chọn phương thức thanh toán</Text>
          <Text style={styles.headerSubtitle}>Chọn cách thanh toán phù hợp với bạn</Text>
        </View>

        {/* Book Info */}
        <View style={styles.bookInfoCard}>
          <View style={styles.bookInfoContent}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>Tác giả: {book.author}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.price}>{book.price}</Text>
              {book.originalPrice && (
                <Text style={styles.originalPrice}>{book.originalPrice}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Stripe Payment Form */}
        {selectedMethod === 'stripe' && (
          <StripePaymentForm
            bookData={{
              bookId: book.id,
              bookTitle: book.title,
              bookAuthor: book.author,
              price: parseInt(book.price.replace(/[^\d]/g, '')),
              currency: 'vnd',
              customerEmail: 'customer@example.com',
              customerName: 'Customer',
            }}
            onPaymentSuccess={handleStripePaymentSuccess}
            onPaymentError={handleStripePaymentError}
          />
        )}

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <View style={styles.promoInputContainer}>
            <Text style={styles.promoInput}>Nhập mã giảm giá (tùy chọn)</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giá sách:</Text>
            <Text style={styles.summaryValue}>{book.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-0đ</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{book.price}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedMethod !== 'stripe' && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMethod && styles.disabledButton
            ]}
            onPress={handleContinuePayment}
            disabled={!selectedMethod}
          >
            <Text style={styles.continueButtonText}>
              Tiếp tục thanh toán
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  bookInfoCard: {
    backgroundColor: COLORS.surface,
    margin: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfoContent: {
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  bookAuthor: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginRight: SIZES.spacing.xs,
  },
  price: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SIZES.spacing.sm,
  },
  originalPrice: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  paymentMethodsSection: {
    margin: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  paymentMethodsList: {
    gap: SIZES.spacing.sm,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  disabledPaymentMethod: {
    opacity: 0.6,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: SIZES.icon.lg,
    marginRight: SIZES.spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  paymentMethodDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  disabledText: {
    color: COLORS.textLight,
  },
  paymentMethodRight: {
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.sm,
    fontWeight: 'bold',
  },
  unavailableText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  promoSection: {
    margin: SIZES.spacing.lg,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promoInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    padding: SIZES.spacing.sm,
  },
  promoButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  promoButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: COLORS.surface,
    margin: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  summaryLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  discountValue: {
    color: COLORS.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  totalLabel: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomContainer: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    ...COMMON_STYLES.buttonPrimary,
    paddingVertical: SIZES.spacing.md,
  },
  disabledButton: {
    backgroundColor: COLORS.gray400,
  },
  continueButtonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
  },
});

export default PaymentMethodScreen;
