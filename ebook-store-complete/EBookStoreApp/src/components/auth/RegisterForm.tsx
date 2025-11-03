import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { RegisterRequest } from '../../types';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
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
  const { register, logout, isLoading } = useAuth();
  const router = useRouter();

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

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      // Prepare data for API
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        address: formData.address.trim() || null,
      };

      console.log('Registration data:', registrationData);
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
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="example@email.com"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

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
});

export default RegisterForm;
