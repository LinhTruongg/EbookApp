import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../../services/api';
import { Category } from '../../../types';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
}

const ManageCategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
  });
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCategories();
      if (response.success) {
        const normalized = (response.data || []).map((c: any) => ({
          ...c,
          id: String(c.id),
        }));
        setCategories(normalized);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách danh mục');
      }
    } catch (error) {
      console.error('Load categories error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
    if (nameError && name.trim()) {
      setNameError('');
    }
  };

  const validateName = (): boolean => {
    if (!formData.name.trim()) {
      setNameError('Tên danh mục là bắt buộc');
      return false;
    }
    setNameError('');
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      isActive: true,
    });
    setEditingCategory(null);
    setNameError('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId?.toString() || '',
      isActive: category.isActive,
    });
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateName()) {
      return;
    }
    
    if (!formData.slug.trim()) {
      Alert.alert('Lỗi', 'Slug là bắt buộc');
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        const response = await apiService.updateCategory(editingCategory.id, submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Cập nhật danh mục thành công');
          setModalVisible(false);
          loadCategories();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể cập nhật danh mục');
        }
      } else {
        const response = await apiService.createCategory(submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Tạo danh mục thành công');
          setModalVisible(false);
          loadCategories();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tạo danh mục');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      console.log('📂 Confirm delete category:', {
        id: categoryToDelete.id,
        name: categoryToDelete.name,
      });
      
      const response = await apiService.deleteCategory(categoryToDelete.id);
      if (response.success) {
        Alert.alert('Thành công', 'Xóa danh mục thành công');
        setDeleteDialogVisible(false);
        setCategoryToDelete(null);
        await loadCategories();
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể xóa danh mục');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục';
      Alert.alert('Lỗi', message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setCategoryToDelete(null);
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categorySlug}>/{item.slug}</Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.categoryMeta}>
          <Text style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Text>
          <Text style={styles.booksCount}>{item.booksCount} sách</Text>
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
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
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
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
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Thêm danh mục</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên danh mục *</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                value={formData.name}
                onChangeText={handleNameChange}
                onBlur={validateName}
                placeholder="Nhập tên danh mục"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Slug *</Text>
              <TextInput
                style={styles.input}
                value={formData.slug}
                onChangeText={(text) => setFormData(prev => ({ ...prev, slug: text }))}
                placeholder="slug-danh-muc"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Nhập mô tả danh mục"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Chủ đề cha</Text>
              <TextInput
                style={styles.input}
                value={formData.parentId}
                onChangeText={(text) => setFormData(prev => ({ ...prev, parentId: text }))}
                placeholder="ID danh mục cha (để trống nếu là danh mục gốc)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Trạng thái hoạt động</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, editingCategory ? styles.updateButton : styles.createButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="🗑️ Xác nhận xóa danh mục"
        message={
          categoryToDelete
            ? `Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete.name}"?\n\n⚠️ Không thể hoàn tác.`
            : ''
        }
        confirmText="🗑️ Xóa"
        cancelText="❌ Hủy"
        type="danger"
        loading={deleting}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  categoryItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categorySlug: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryMeta: {
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
  booksCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  updateButton: {
    backgroundColor: '#28a745',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageCategoriesScreen;
