import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants';
import { User } from '../../../types';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return false;
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        address: formData.address,
      };

      await updateProfile(updateData);
      
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error('Update profile error:', error);
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (value: string) => {
    if (value) {
      const date = new Date(value);
      setFormData(prev => ({
        ...prev,
        dateOfBirth: date.toISOString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: '',
      }));
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cập nhật thông tin</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Nhập họ"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Nhập tên"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={COLORS.gray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formatDateForInput(formData.dateOfBirth)}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.genderButtonSelected,
                  ]}
                  onPress={() => handleInputChange('gender', gender)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextSelected,
                    ]}
                  >
                    {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Nhập địa chỉ"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  genderButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: SIZES.font.md,
    fontWeight: '500',
  },
  errorText: {
    fontSize: SIZES.font.md,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 50,
  },
});
