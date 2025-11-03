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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES } from '../../../constants';
import { User } from '../../../types';
import DateTimeField from '../../../components/common/DateTimeField';

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

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
      setAvatarPreview(user.avatar || null);
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
        avatarBase64: avatarBase64 || undefined,
      };

      await updateProfile(updateData);
      setAvatarBase64(null);
      
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error('Update profile error:', error);
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setAvatarPreview(asset.uri);
        setAvatarBase64(asset.base64 || null);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarBase64(''); // signal clearing avatar when saving
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
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar}>
            {avatarPreview ? (
              <Image source={{ uri: avatarPreview }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.defaultAvatarText}>
                  {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatarActions}>
            <TouchableOpacity style={[styles.smallButton, styles.primaryButton]} onPress={pickAvatar}>
              <Text style={styles.smallButtonText}>Chọn ảnh</Text>
            </TouchableOpacity>
            {avatarPreview && (
              <TouchableOpacity style={[styles.smallButton, styles.outlineButton]} onPress={removeAvatar}>
                <Text style={styles.outlineButtonText}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Nhập họ"
              placeholderTextColor={COLORS.textPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Nhập tên"
              placeholderTextColor={COLORS.textPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={COLORS.textPlaceholder}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <DateTimeField
              label="Ngày sinh"
              value={formData.dateOfBirth}
              onChange={(iso) => handleInputChange('dateOfBirth', iso)}
              mode="date"
              maximumDate={new Date()}
              placeholder="Chọn ngày sinh"
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
              placeholderTextColor={COLORS.textPlaceholder}
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
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  defaultAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  smallButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outlineButtonText: {
    color: COLORS.text,
    fontWeight: '600',
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
    borderColor: COLORS.border,
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
    borderColor: COLORS.border,
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
    borderColor: COLORS.border,
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
