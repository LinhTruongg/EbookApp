import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

type Step = 'email' | 'verify' | 'reset' | 'success';

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [forgotPasswordToken, setForgotPasswordToken] = useState<string>('');
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { forgotPassword, verifyForgotPassword, resetPassword } = useAuth();

  useEffect(() => {
    if (currentStep === 'verify' || currentStep === 'reset') {
      if (!timerRef.current && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStep]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmailForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerifyForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!resetCode.trim()) {
      newErrors.resetCode = 'Mã xác thực là bắt buộc';
    } else if (!/^\d{6}$/.test(resetCode)) {
      newErrors.resetCode = 'Mã xác thực phải là 6 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateEmailForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword(email);
      
      if (response?.data?.token) {
        setForgotPasswordToken(response.data.token);
        setCurrentStep('verify');
        setTimeLeft(600);
      } else {
        setCurrentStep('verify');
        setTimeLeft(600);
      }
      
      // In development, show code and error info if available
      if (response?.debug) {
        const { resetCode, emailConfigured, emailError } = response.debug;
        let message = '';
        
        if (emailError) {
          message = `❌ Lỗi gửi email:\n${emailError.message}\n\n`;
          if (emailError.code === 'EAUTH') {
            message += 'Lỗi xác thực Gmail. Kiểm tra:\n';
            message += '- GMAIL_USER và GMAIL_PASS trong .env\n';
            message += '- Đã dùng App Password (không phải mật khẩu thường)\n';
            message += '- Đã bật 2-Step Verification';
          } else if (emailError.code === 'ECONNECTION') {
            message += 'Không thể kết nối SMTP. Kiểm tra kết nối internet.';
          }
          message += `\n\n🔑 Mã xác thực (dùng để test): ${resetCode}`;
        } else if (!emailConfigured) {
          message = `🔑 Mã xác thực: ${resetCode}\n\nEmail service chưa được cấu hình. Mã này chỉ hiển thị trong development mode.`;
        } else {
          message = `🔑 Mã xác thực: ${resetCode}`;
        }
        
        Alert.alert(
          'Mã xác thực (Development)',
          message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateVerifyForm()) {
      return;
    }

    if (timeLeft === 0) {
      Alert.alert('Mã đã hết hạn', 'Vui lòng yêu cầu mã mới');
      return;
    }

    if (!forgotPasswordToken) {
      Alert.alert('Lỗi', 'Token không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyForgotPassword(forgotPasswordToken, resetCode);
      
      if (response?.data?.token) {
        setVerifyToken(response.data.token);
        setCurrentStep('reset');
        setResetCode('');
        setErrors({});
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác thực mã OTP';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetForm()) {
      return;
    }

    if (!verifyToken) {
      Alert.alert('Lỗi', 'Token không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(verifyToken, newPassword);
      setCurrentStep('success');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const response = await forgotPassword(email);
      
      if (response?.data?.token) {
        setForgotPasswordToken(response.data.token);
      }
      
      setResetCode('');
      setErrors({});
      setTimeLeft(600);
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert('Lỗi', 'Không thể gửi lại mã. Vui lòng thử lại sau');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
    setForgotPasswordToken('');
    setVerifyToken('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(600);
  };

  const handleTryAgain = () => {
    setCurrentStep('email');
    setEmail('');
    setForgotPasswordToken('');
    setVerifyToken('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(600);
  };

  const renderEmailStep = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      <Text style={styles.subtitle}>
        Nhập email của bạn và chúng tôi sẽ gửi mã xác thực 6 số để đặt lại mật khẩu
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Nhập email của bạn"
          placeholderTextColor={COLORS.textPlaceholder}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (errors.email) {
              setErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleForgotPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Gửi mã xác thực</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBackToEmail} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Nhập mã xác thực</Text>
      <Text style={styles.subtitle}>
        Chúng tôi đã gửi mã 6 số đến{'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Mã có hiệu lực trong: <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </Text>
        {timeLeft === 0 && (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.resendButtonText}>Gửi lại mã</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã xác thực (6 số) *</Text>
        <TextInput
          style={[styles.input, styles.codeInput, errors.resetCode && styles.inputError]}
          placeholder="000000"
          placeholderTextColor={COLORS.textPlaceholder}
          value={resetCode}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
            setResetCode(numericValue);
            if (errors.resetCode) {
              setErrors(prev => ({ ...prev, resetCode: '' }));
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading && timeLeft > 0}
        />
        {errors.resetCode && <Text style={styles.errorText}>{errors.resetCode}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || timeLeft === 0) && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={isLoading || timeLeft === 0}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Xác thực mã</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderResetStep = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setCurrentStep('verify')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>
        Mã xác thực đã được xác nhận.{'\n'}
        Vui lòng nhập mật khẩu mới của bạn.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới *</Text>
        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor={COLORS.textPlaceholder}
          value={newPassword}
          onChangeText={(value) => {
            setNewPassword(value);
            if (errors.newPassword) {
              setErrors(prev => ({ ...prev, newPassword: '' }));
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu *</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Nhập lại mật khẩu mới"
          placeholderTextColor={COLORS.textPlaceholder}
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            if (errors.confirmPassword) {
              setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Đặt lại mật khẩu thành công!</Text>
        <Text style={styles.successMessage}>
          Mật khẩu của bạn đã được đặt lại thành công.
          {'\n'}Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
        </Text>
      </View>
    </View>
  );

  if (currentStep === 'success') {
    return renderSuccessStep();
  }

  if (currentStep === 'reset') {
    return renderResetStep();
  }

  if (currentStep === 'verify') {
    return renderVerifyStep();
  }

  return renderEmailStep();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  emailText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.borderRadius.md,
  },
  timerText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  timerValue: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  resendButton: {
    marginTop: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  label: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  input: {
    ...COMMON_STYLES.input,
    height: SIZES.input.md,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: SIZES.font.xl,
    letterSpacing: 8,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: SIZES.font.xs,
    color: COLORS.error,
    marginTop: SIZES.spacing.xs,
  },
  button: {
    ...COMMON_STYLES.buttonPrimary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
    opacity: 0.6,
  },
  buttonText: {
    ...COMMON_STYLES.textButton,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.lg,
  },
  successTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SIZES.spacing.md,
  },
});

export default ForgotPasswordForm;
