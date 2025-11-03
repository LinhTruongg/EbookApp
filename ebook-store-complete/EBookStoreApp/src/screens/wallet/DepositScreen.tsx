import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { initPaymentSheet, presentPaymentSheet } from '../../utils/stripePay';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    description: 'Chuyển khoản trực tiếp vào tài khoản',
  },
  {
    id: 'card',
    name: 'Thẻ ngân hàng (Stripe)',
    icon: '💳',
    description: 'Thanh toán nhanh bằng thẻ qua Stripe',
    comingSoon: Platform.OS === 'web',
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: '💜',
    description: 'Thanh toán qua ví MoMo',
    comingSoon: true,
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: '💰',
    description: 'Thanh toán qua ZaloPay',
    comingSoon: true,
  },
];

interface BankInfo {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  content: string;
}

export default function DepositScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showBankInfo, setShowBankInfo] = useState(false);

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getWalletBalance();
        if (res?.data?.balance !== undefined) {
          const balance = res.data.balance as any;
          setPointsBalance(balance);
          if (user) {
            updateUser({ ...(user as any), points: balance } as any);
          }
        }
      } catch {}
    })();
  }, []);

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmountSelect = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const validateAmount = (): boolean => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return false;
    }
    if (numAmount < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10,000 VNĐ');
      return false;
    }
    if (numAmount > 50000000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối đa là 50,000,000 VNĐ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedPaymentMethod === 'card') {
        const numAmount = Math.round(parseFloat(amount));
        const pi = await apiService.createPaymentIntent({ amount: numAmount, currency: 'usd' });
        if (!pi.success) throw new Error('Không tạo được PaymentIntent');

        const init = await initPaymentSheet({
          paymentIntentClientSecret: pi.data.clientSecret,
          merchantDisplayName: 'EBook Store',
        });
        if (init.error) throw new Error(init.error.message || 'Không khởi tạo được PaymentSheet');

        const present = await presentPaymentSheet();
        if (present.error) {
          throw new Error(present.error.message || 'Thanh toán thất bại');
        }

        try {
          const cv = await apiService.convertToPoints({ amountCents: numAmount });
          if (cv?.data?.balance !== undefined) {
            const balance = cv.data.balance as any;
            setPointsBalance(balance);
            if (user) {
              updateUser({ ...(user as any), points: balance } as any);
            }
          }
          Toast.show({ type: 'success', text1: 'Thanh toán thành công', text2: 'Điểm đã được cộng' });
        } catch {}
        setIsSubmitting(false);
        router.back();
        return;
      }

      const response = await apiService.createDeposit({
        amount: parseFloat(amount),
        paymentMethod: selectedPaymentMethod,
      });

      if (response.success && response.data) {
        setTransactionId(response.data.transactionId);
        
        if (selectedPaymentMethod === 'bank_transfer' && response.data.bankInfo) {
          setBankInfo(response.data.bankInfo);
          setShowBankInfo(true);
        } else if (response.data.paymentUrl) {
          Alert.alert(
            'Chuyển hướng thanh toán',
            'Bạn sẽ được chuyển đến trang thanh toán',
            [
              {
                text: 'Hủy',
                style: 'cancel',
              },
              {
                text: 'Đồng ý',
                onPress: () => {
                  console.log('Open payment URL:', response.data.paymentUrl);
                },
              },
            ]
          );
        }

        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Yêu cầu nạp tiền đã được tạo',
        });
      } else {
        throw new Error(response.message || 'Không thể tạo yêu cầu nạp tiền');
      }
    } catch (error: any) {
      console.error('Error creating deposit:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.response?.data?.message || error.message || 'Không thể tạo yêu cầu nạp tiền',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBankInfo = (text: string, label: string) => {
    Alert.alert('Đã sao chép', `${label}: ${text}`);
  };

  const handleContinue = () => {
    setShowBankInfo(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nạp tiền</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!showBankInfo ? (
            <>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Số dư điểm</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(pointsBalance)} điểm</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nhập số tiền</Text>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={amount ? formatCurrency(amount) : ''}
                    onChangeText={handleAmountChange}
                    placeholder="Nhập số tiền"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textPlaceholder}
                  />
                  <Text style={styles.currencyLabel}>VNĐ</Text>
                </View>

                <View style={styles.quickAmountsContainer}>
                  <Text style={styles.quickAmountsLabel}>Chọn nhanh:</Text>
                  <View style={styles.quickAmountsRow}>
                    {QUICK_AMOUNTS.map((quickAmount) => (
                      <TouchableOpacity
                        key={quickAmount}
                        style={[
                          styles.quickAmountButton,
                          amount === quickAmount.toString() && styles.quickAmountButtonActive,
                        ]}
                        onPress={() => handleQuickAmountSelect(quickAmount)}
                      >
                        <Text
                          style={[
                            styles.quickAmountText,
                            amount === quickAmount.toString() && styles.quickAmountTextActive,
                          ]}
                        >
                          {formatCurrency(quickAmount)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentMethod === method.id && styles.paymentMethodCardActive,
                      method.comingSoon && styles.paymentMethodCardDisabled,
                    ]}
                    onPress={() => !method.comingSoon && setSelectedPaymentMethod(method.id)}
                    disabled={method.comingSoon}
                  >
                    <View style={styles.paymentMethodContent}>
                      <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                      <View style={styles.paymentMethodInfo}>
                        <View style={styles.paymentMethodHeader}>
                          <Text style={styles.paymentMethodName}>{method.name}</Text>
                          {method.comingSoon && (
                            <Text style={styles.comingSoonBadge}>Sắp ra mắt</Text>
                          )}
                        </View>
                        <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                      </View>
                      {selectedPaymentMethod === method.id && !method.comingSoon && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.selectedCheck}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Xác nhận nạp tiền</Text>
                )}
              </TouchableOpacity>

              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>📝 Lưu ý:</Text>
                <Text style={styles.noteText}>
                  • Số tiền nạp tối thiểu: 10,000 VNĐ{'\n'}
                  • Số tiền nạp tối đa: 50,000,000 VNĐ{'\n'}
                  • Giao dịch sẽ được xử lý trong vòng 5-15 phút{'\n'}
                  • Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.bankInfoContainer}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.bankInfoTitle}>Thông tin chuyển khoản</Text>
              <Text style={styles.bankInfoSubtitle}>
                Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới
              </Text>

              {bankInfo && (
                <View style={styles.bankInfoCard}>
                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
                    <View style={styles.bankInfoValueContainer}>
                      <Text style={styles.bankInfoValue}>{bankInfo.accountNumber}</Text>
                      <TouchableOpacity
                        onPress={() => handleCopyBankInfo(bankInfo.accountNumber, 'Số tài khoản')}
                        style={styles.copyButton}
                      >
                        <Text style={styles.copyButtonText}>Sao chép</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Tên tài khoản:</Text>
                    <View style={styles.bankInfoValueContainer}>
                      <Text style={styles.bankInfoValue}>{bankInfo.accountName}</Text>
                      <TouchableOpacity
                        onPress={() => handleCopyBankInfo(bankInfo.accountName, 'Tên tài khoản')}
                        style={styles.copyButton}
                      >
                        <Text style={styles.copyButtonText}>Sao chép</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
                    <Text style={styles.bankInfoValue}>{bankInfo.bankName}</Text>
                  </View>

                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Số tiền:</Text>
                    <Text style={[styles.bankInfoValue, styles.bankInfoAmount]}>
                      {formatCurrency(bankInfo.amount)} VNĐ
                    </Text>
                  </View>

                  <View style={styles.bankInfoRow}>
                    <Text style={styles.bankInfoLabel}>Nội dung chuyển khoản:</Text>
                    <View style={styles.bankInfoValueContainer}>
                      <Text style={[styles.bankInfoValue, styles.bankInfoContent]}>
                        {bankInfo.content}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleCopyBankInfo(bankInfo.content, 'Nội dung')}
                        style={styles.copyButton}
                      >
                        <Text style={styles.copyButtonText}>Sao chép</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionInfoText}>
                  Mã giao dịch: {transactionId}
                </Text>
              </View>

              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Hoàn tất</Text>
              </TouchableOpacity>

              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>⏱️ Thời gian xử lý:</Text>
                <Text style={styles.noteText}>
                  • Sau khi chuyển khoản, tiền sẽ được cập nhật vào tài khoản trong vòng 5-15 phút{'\n'}
                  • Nếu sau 30 phút chưa nhận được tiền, vui lòng liên hệ bộ phận hỗ trợ
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...COMMON_STYLES.shadow,
  },
  backButton: {
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  backIcon: {
    fontSize: SIZES.font.xl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.xl,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
    alignItems: 'center',
    ...COMMON_STYLES.shadowMd,
  },
  balanceLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.spacing.sm,
  },
  balanceAmount: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...COMMON_STYLES.shadow,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    backgroundColor: COLORS.gray50,
    marginBottom: SIZES.spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: SIZES.font.xl,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: SIZES.spacing.md,
  },
  currencyLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.sm,
    fontWeight: '500',
  },
  quickAmountsContainer: {
    marginTop: SIZES.spacing.sm,
  },
  quickAmountsLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  quickAmountButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  paymentMethodCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
  },
  paymentMethodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.gray50,
  },
  paymentMethodCardDisabled: {
    opacity: 0.6,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: SIZES.icon.xl,
    marginRight: SIZES.spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  paymentMethodName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  comingSoonBadge: {
    fontSize: SIZES.font.xs,
    color: COLORS.warning,
    marginLeft: SIZES.spacing.sm,
    fontWeight: '500',
  },
  paymentMethodDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
  },
  submitButton: {
    ...COMMON_STYLES.buttonPrimary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
  },
  noteTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  noteText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bankInfoContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  successIcon: {
    fontSize: 48,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  bankInfoTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  bankInfoSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xl,
    textAlign: 'center',
    paddingHorizontal: SIZES.spacing.lg,
  },
  bankInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    width: '100%',
    marginBottom: SIZES.spacing.lg,
    ...COMMON_STYLES.shadow,
  },
  bankInfoRow: {
    marginBottom: SIZES.spacing.md,
  },
  bankInfoLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  bankInfoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankInfoValue: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  bankInfoAmount: {
    fontSize: SIZES.font.lg,
    color: COLORS.primary,
  },
  bankInfoContent: {
    fontSize: SIZES.font.sm,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.sm,
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.spacing.sm,
  },
  copyButtonText: {
    fontSize: SIZES.font.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  transactionInfo: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    width: '100%',
    marginBottom: SIZES.spacing.lg,
  },
  transactionInfoText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  continueButton: {
    ...COMMON_STYLES.buttonPrimary,
    width: '100%',
    marginBottom: SIZES.spacing.lg,
  },
  continueButtonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
});
