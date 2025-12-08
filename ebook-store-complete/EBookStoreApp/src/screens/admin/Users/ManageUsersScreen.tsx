import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { apiService } from '../../../services/api';
import { User } from '../../../types';
import DateTimeField from '../../../components/common/DateTimeField';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface ManageUsersScreenProps {
  route?: {
    params?: {
      editUser?: User;
    };
  };
  navigation?: any;
}

const ManageUsersScreen: React.FC<ManageUsersScreenProps> = ({ route, navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    role: 'user',
    isActive: true,
    isVerified: false,
  });

  useEffect(() => {
    loadUsers();
    if (route?.params?.editUser) {
      setEditingUser(route.params.editUser);
      setFormData({
        firstName: route.params.editUser.firstName,
        lastName: route.params.editUser.lastName,
        email: route.params.editUser.email,
        password: '',
        phone: route.params.editUser.phone || '',
        dateOfBirth: route.params.editUser.dateOfBirth || '',
        gender: route.params.editUser.gender || 'male',
        address: route.params.editUser.address || '',
        role: route.params.editUser.role || 'user',
        isActive: route.params.editUser.isActive,
        isVerified: route.params.editUser.isVerified || false,
      });
      setModalVisible(true);
    }
  }, [route?.params?.editUser]);

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const searchParams: any = {};
      
      if (searchQuery.trim()) {
        searchParams.search = searchQuery.trim();
      }
      
      const response = await apiService.getAllUsersAdmin(searchParams);
      if (response.success) {
        setUsers(response.data || []);
        setFilteredUsers(response.data || []);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      role: 'user',
      isActive: true,
      isVerified: false,
    });
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      Alert.alert('Lỗi', 'Họ tên và email là bắt buộc');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      Alert.alert('Lỗi', 'Mật khẩu là bắt buộc khi tạo người dùng mới');
      return;
    }

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        address: formData.address.trim() || undefined,
        role: formData.role,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      if (editingUser) {
        const response = await apiService.updateUser(editingUser.id.toString(), submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Cập nhật người dùng thành công');
          setModalVisible(false);
          resetForm();
          loadUsers();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể cập nhật người dùng');
        }
      } else {
        const response = await apiService.createUser(submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Tạo người dùng thành công');
          setModalVisible(false);
          resetForm();
          loadUsers();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tạo người dùng');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      const response = await apiService.deleteUser(userToDelete.id.toString());
      if (response.success) {
        Alert.alert('Thành công', response.message || 'Xóa người dùng thành công');
        setDeleteDialogVisible(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể xóa người dùng');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa người dùng');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setUserToDelete(null);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone || 'Chưa có SĐT'}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Text>
          <Text style={styles.userRole}>
            {item.role === 'admin' ? '👑 Admin' : '👤 User'}
          </Text>
          {item.isVerified && <Text style={styles.verifiedBadge}>✅ Đã xác thực</Text>}
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingUser(item);
            setFormData({
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              password: '',
              phone: item.phone || '',
              dateOfBirth: item.dateOfBirth || '',
              gender: item.gender || 'male',
              address: item.address || '',
              role: item.role || 'user',
              isActive: item.isActive,
              isVerified: item.isVerified || false,
            });
            setModalVisible(true);
          }}
          accessibilityLabel="Sửa"
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          accessibilityLabel="Xóa"
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Thêm người dùng</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        accessibilityViewIsModal={true}
        accessibilityLabel="Form thêm/sửa người dùng"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Họ *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  placeholder="Nhập họ"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Tên *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  placeholder="Nhập tên"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Nhập email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Mật khẩu {!editingUser ? '*' : '(để trống nếu không đổi)'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Nhập mật khẩu"
                secureTextEntry
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Nhập SĐT"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'male' && styles.selectedGenderButton
                    ]}
                    onPress={() => setFormData({ ...formData, gender: 'male' })}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === 'male' && styles.selectedGenderButtonText
                    ]}>
                      Nam
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'female' && styles.selectedGenderButton
                    ]}
                    onPress={() => setFormData({ ...formData, gender: 'female' })}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === 'female' && styles.selectedGenderButtonText
                    ]}>
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <DateTimeField
                label="Ngày sinh"
                value={formData.dateOfBirth}
                onChange={(iso) => setFormData({ ...formData, dateOfBirth: iso })}
                mode="date"
                maximumDate={new Date()}
                placeholder="Chọn ngày sinh"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Nhập địa chỉ"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vai trò</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'user' && styles.selectedRoleButton
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'user' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'user' && styles.selectedRoleButtonText
                  ]}>
                    👤 User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'admin' && styles.selectedRoleButton
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'admin' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'admin' && styles.selectedRoleButtonText
                  ]}>
                    👑 Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Hoạt động</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Đã xác thực</Text>
                <Switch
                  value={formData.isVerified}
                  onValueChange={(value) => setFormData({ ...formData, isVerified: value })}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editingUser ? 'Cập nhật người dùng' : 'Tạo người dùng'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="🗑️ Xác nhận xóa người dùng"
        message={
          userToDelete
            ? `Bạn có chắc chắn muốn xóa người dùng "${userToDelete.firstName} ${userToDelete.lastName}"?\n\n⚠️ Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText="🗑️ Xóa"
        cancelText="❌ Hủy"
        type="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    height: 40,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748B',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedGenderButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedGenderButtonText: {
    color: '#FFFFFF',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedRoleButtonText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageUsersScreen;
