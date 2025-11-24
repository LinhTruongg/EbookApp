import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { RegisterRequest } from '../../types';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<RegisterRequest, 'otpToken'>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    address: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { register, logout, isLoading, sendRegistrationOTP, verifyRegistrationOTP } = useAuth();
  const router = useRouter();
  
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (otpSent && !otpVerified && timeLeft > 0) {
      if (!timerRef.current) {
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
  }, [otpSent, otpVerified, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!otpCode.trim()) {
      newErrors.otpCode = 'Mã xác thực là bắt buộc';
    } else if (!/^\d{6}$/.test(otpCode)) {
      newErrors.otpCode = 'Mã xác thực phải là 6 chữ số';
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Họ là bắt buộc';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Tên là bắt buộc';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!otpVerified) {
      newErrors.otpVerified = 'Vui lòng xác thực email trước khi đăng ký';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Optional fields validation
    if (formData.phone && !/^0[0-9]{9,10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) {
      return;
    }

    try {
      setIsSendingOTP(true);
      const response = await sendRegistrationOTP(formData.email.trim().toLowerCase());
      
      if (response?.data?.token) {
        setOtpToken(response.data.token);
        setOtpSent(true);
        setTimeLeft(600);
      }
      
      if (response?.debug) {
        const { otpCode, emailConfigured, emailError } = response.debug;
        let message = '';
        
        if (emailError) {
          message = `❌ Lỗi gửi email:\n${emailError.message}\n\n`;
          message += `🔑 Mã xác thực (dùng để test): ${otpCode}`;
        } else if (!emailConfigured) {
          message = `🔑 Mã xác thực: ${otpCode}\n\nEmail service chưa được cấu hình. Mã này chỉ hiển thị trong development mode.`;
        } else {
          message = `🔑 Mã xác thực: ${otpCode}`;
        }
        
        Alert.alert(
          'Mã xác thực (Development)',
          message,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) {
      return;
    }

    if (timeLeft === 0) {
      Alert.alert('Mã đã hết hạn', 'Vui lòng yêu cầu mã mới');
      return;
    }

    if (!otpToken) {
      Alert.alert('Lỗi', 'Token không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    try {
      setIsVerifyingOTP(true);
      const response = await verifyRegistrationOTP(otpToken, otpCode);
      
      if (response?.data?.token) {
        setVerifyToken(response.data.token);
        setOtpVerified(true);
        setOtpCode('');
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.otpCode;
          return newErrors;
        });
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const response = await sendRegistrationOTP(formData.email.trim().toLowerCase());
      
      if (response?.data?.token) {
        setOtpToken(response.data.token);
      }
      
      setOtpCode('');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.otpCode;
        return newErrors;
      });
      setTimeLeft(600);
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Lỗi', 'Không thể gửi lại mã. Vui lòng thử lại sau');
    } finally {
      setIsResending(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    if (!otpVerified || !verifyToken) {
      Alert.alert('Lỗi', 'Vui lòng xác thực email trước khi đăng ký');
      return;
    }

    try {
      // Prepare data for API
      const registrationData: RegisterRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        otpToken: verifyToken,
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        address: formData.address.trim() || null,
      };

      console.log('Registration data:', { ...registrationData, password: '***', otpToken: '***' });
      await register(registrationData);
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const updateFormData = (field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      console.log('Date selected:', selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      
      {/* Name Fields */}
      <View style={styles.rowContainer}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Họ *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="Nhập họ"
            placeholderTextColor="#C4C4C4"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Tên *</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Nhập tên"
            placeholderTextColor="#C4C4C4"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      {/* Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email *</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={[styles.input, styles.emailInput, errors.email && styles.inputError]}
            placeholder="example@email.com"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={(value) => {
              updateFormData('email', value);
              if (otpSent) {
                setOtpSent(false);
                setOtpVerified(false);
                setOtpToken('');
                setVerifyToken('');
                setOtpCode('');
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSendingOTP && !otpVerified}
          />
          <TouchableOpacity
            style={[styles.sendButton, (isSendingOTP || !formData.email.trim() || otpVerified) && styles.sendButtonDisabled]}
            onPress={handleSendOTP}
            disabled={isSendingOTP || !formData.email.trim() || otpVerified}
          >
            {isSendingOTP ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>{otpVerified ? '✓' : 'Gửi'}</Text>
            )}
          </TouchableOpacity>
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* OTP Field */}
      {otpSent && !otpVerified && (
        <View style={styles.fieldContainer}>
          <View style={styles.otpHeader}>
            <Text style={styles.label}>Mã xác thực (6 số) *</Text>
            {timeLeft > 0 && (
              <Text style={styles.timerText}>
                Còn lại: <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
              </Text>
            )}
          </View>
          <TextInput
            style={[styles.input, styles.otpInput, errors.otpCode && styles.inputError]}
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            value={otpCode}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
              setOtpCode(numericValue);
              if (errors.otpCode) {
                setErrors(prev => ({ ...prev, otpCode: '' }));
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isVerifyingOTP && timeLeft > 0}
          />
          {errors.otpCode && <Text style={styles.errorText}>{errors.otpCode}</Text>}
          <View style={styles.otpActions}>
            <TouchableOpacity
              style={[styles.verifyButton, (isVerifyingOTP || timeLeft === 0) && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isVerifyingOTP || timeLeft === 0}
            >
              {isVerifyingOTP ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Xác thực</Text>
              )}
            </TouchableOpacity>
            {timeLeft === 0 && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator color="#667eea" size="small" />
                ) : (
                  <Text style={styles.resendButtonText}>Gửi lại mã</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          {otpVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Email đã được xác thực</Text>
            </View>
          )}
        </View>
      )}

      {otpVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Email đã được xác thực</Text>
        </View>
      )}

      {/* Password Fields */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Mật khẩu *</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Mật khẩu (chữ thường, hoa, số)"
          placeholderTextColor="#9CA3AF"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu *</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#9CA3AF"
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
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Optional Fields */}
      <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>

      {/* Phone and Gender Row */}
      <View style={styles.rowContainer}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="0123456789"
            placeholderTextColor="#C4C4C4"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Giới tính</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={[styles.selectText, !formData.gender && styles.placeholderText]}>
              {formData.gender === 'male' ? 'Nam' : 
               formData.gender === 'female' ? 'Nữ' : 
               formData.gender === 'other' ? 'Khác' : 'Chọn'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn giới tính</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                updateFormData('gender', 'male');
                setShowGenderModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Nam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                updateFormData('gender', 'female');
                setShowGenderModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Nữ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                updateFormData('gender', 'other');
                setShowGenderModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Khác</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date of Birth and Address */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Ngày sinh</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            console.log('Date input pressed, showing picker');
            if (formData.dateOfBirth) {
              try {
                setSelectedDate(new Date(formData.dateOfBirth));
              } catch (e) {
                setSelectedDate(new Date());
              }
            } else {
              setSelectedDate(new Date());
            }
            setShowDatePicker(true);
          }}
        >
          <Text style={[styles.dateText, !formData.dateOfBirth && styles.placeholderText]}>
            {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={styles.datePickerModal}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      const localIsoDate = `${year}-${month}-${day}`;
                      updateFormData('dateOfBirth', localIsoDate);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(event, date) => {
              if (event.type === 'dismissed') {
                setShowDatePicker(false);
                return;
              }
              if (event.type === 'set' && date) {
                setSelectedDate(date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const localIsoDate = `${year}-${month}-${day}`;
                updateFormData('dateOfBirth', localIsoDate);
                setShowDatePicker(false);
              }
            }}
          />
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Nhập địa chỉ của bạn"
          placeholderTextColor="#9CA3AF"
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          multiline
          numberOfLines={2}
          autoCapitalize="sentences"
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, isLoading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.registerButtonText}>
          {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E293B',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfWidth: {
    width: '48%',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 16,
    marginBottom: 8,
  },
  selectInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  selectText: {
    fontSize: 14,
    color: '#1E293B',
  },
  placeholderText: {
    color: '#C4C4C4',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
  },
  calendarIcon: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#667eea',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 320,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E293B',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1E293B',
  },
  modalCancel: {
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF4444',
    fontWeight: '600',
  },
  textArea: {
    height: 60,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    color: '#1E293B',
  },
  registerButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#667eea',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
  datePickerIOS: {
    height: 200,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  datePickerModal: {
    height: 200,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  emailInput: {
    flex: 1,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: '600',
    marginBottom: 8,
  },
  otpActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  verifyButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterForm;
