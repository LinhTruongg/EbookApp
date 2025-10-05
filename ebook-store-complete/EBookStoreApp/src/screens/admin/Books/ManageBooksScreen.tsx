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
import { Book, Category, Author } from '../../../types';

interface ManageBooksScreenProps {
  route?: {
    params?: {
      editBook?: Book;
    };
  };
  navigation?: any;
}

const ManageBooksScreen: React.FC<ManageBooksScreenProps> = ({ route, navigation }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    isbn: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    publisher: '',
    publicationDate: '',
    pageCount: '',
    language: 'vi',
    authorIds: [] as string[],
    status: 'active',
    isFeatured: false,
    isBestseller: false,
    isNewRelease: false,
  });

  useEffect(() => {
    loadData();
    if (route?.params?.editBook) {
      setEditingBook(route.params.editBook);
      setFormData({
        title: route.params.editBook.title,
        subtitle: route.params.editBook.subtitle || '',
        description: route.params.editBook.description,
        isbn: route.params.editBook.isbn || '',
        price: route.params.editBook.price.toString(),
        discountPrice: route.params.editBook.discountPrice?.toString() || '',
        categoryId: route.params.editBook.categoryId?.toString() || '',
        publisher: route.params.editBook.publisher || '',
        publicationDate: route.params.editBook.publicationDate || '',
        pageCount: route.params.editBook.pageCount?.toString() || '',
        language: route.params.editBook.language || 'vi',
        authorIds: route.params.editBook.authors?.map(a => a.id) || [],
        status: route.params.editBook.status || 'active',
        isFeatured: route.params.editBook.isFeatured || false,
        isBestseller: route.params.editBook.isBestseller || false,
        isNewRelease: route.params.editBook.isNewRelease || false,
      });
      setModalVisible(true);
    }
  }, [route?.params?.editBook]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksResponse, categoriesResponse] = await Promise.all([
        apiService.getAllBooksAdmin(),
        apiService.getAllCategories(),
      ]);

      if (booksResponse.success) {
        setBooks(booksResponse.data || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      isbn: '',
      price: '',
      discountPrice: '',
      categoryId: '',
      publisher: '',
      publicationDate: '',
      pageCount: '',
      language: 'vi',
      authorIds: [],
      status: 'active',
      isFeatured: false,
      isBestseller: false,
      isNewRelease: false,
    });
    setEditingBook(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price.trim() || !formData.categoryId.trim()) {
      Alert.alert('Lỗi', 'Tiêu đề, mô tả, giá và danh mục là bắt buộc');
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        description: formData.description.trim(),
        isbn: formData.isbn.trim() || undefined,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        categoryId: parseInt(formData.categoryId),
        publisher: formData.publisher.trim() || undefined,
        publicationDate: formData.publicationDate || undefined,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
        language: formData.language,
        authorIds: formData.authorIds,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        isNewRelease: formData.isNewRelease,
      };

      if (editingBook) {
        const response = await apiService.updateBook(editingBook.id, submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Cập nhật sách thành công');
          setModalVisible(false);
          resetForm();
          loadData();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể cập nhật sách');
        }
      } else {
        const response = await apiService.createBook(submitData);
        if (response.success) {
          Alert.alert('Thành công', 'Tạo sách thành công');
          setModalVisible(false);
          resetForm();
          loadData();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tạo sách');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };

  const handleDelete = (book: Book) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa sách "${book.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteBook(book.id);
              if (response.success) {
                Alert.alert('Thành công', response.message || 'Xóa sách thành công');
                loadData();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xóa sách');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa sách');
            }
          },
        },
      ]
    );
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>
          Tác giả: {item.authors?.[0]?.name || 'Chưa có'}
        </Text>
        <Text style={styles.bookCategory}>
          📂 {item.category?.name || 'Chưa phân loại'}
        </Text>
        <Text style={styles.bookPrice}>
          💰 {item.discountPrice ? item.discountPrice.toLocaleString() : item.price.toLocaleString()} VNĐ
        </Text>
        <View style={styles.bookMeta}>
          <View style={[
            styles.statusBadge,
            item.status === 'active' ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'active' ? styles.activeText : styles.inactiveText
            ]}>
              {item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
          {item.isFeatured && <Text style={styles.featuredBadge}>⭐ Nổi bật</Text>}
        </View>
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingBook(item);
            setFormData({
              title: item.title,
              subtitle: item.subtitle || '',
              description: item.description,
              isbn: item.isbn || '',
              price: item.price.toString(),
              discountPrice: item.discountPrice?.toString() || '',
              categoryId: item.categoryId?.toString() || '',
              publisher: item.publisher || '',
              publicationDate: item.publicationDate || '',
              pageCount: item.pageCount?.toString() || '',
              language: item.language || 'vi',
              authorIds: item.authors?.map(a => a.id) || [],
              status: item.status || 'active',
              isFeatured: item.isFeatured || false,
              isBestseller: item.isBestseller || false,
              isNewRelease: item.isNewRelease || false,
            });
            setModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý sách</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Thêm sách</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sách..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        style={styles.booksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📚 Chưa có sách nào</Text>
            <Text style={styles.emptySubtext}>Hãy thêm cuốn sách đầu tiên của bạn</Text>
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
              {editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
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
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Nhập tiêu đề sách"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tiêu đề phụ</Text>
              <TextInput
                style={styles.input}
                value={formData.subtitle}
                onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                placeholder="Nhập tiêu đề phụ"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Nhập mô tả sách"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>ISBN</Text>
                <TextInput
                  style={styles.input}
                  value={formData.isbn}
                  onChangeText={(text) => setFormData({ ...formData, isbn: text })}
                  placeholder="Nhập ISBN"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Ngôn ngữ</Text>
                <TextInput
                  style={styles.input}
                  value={formData.language}
                  onChangeText={(text) => setFormData({ ...formData, language: text })}
                  placeholder="vi, en, ..."
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Giá *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="Nhập giá"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Giá khuyến mãi</Text>
                <TextInput
                  style={styles.input}
                  value={formData.discountPrice}
                  onChangeText={(text) => setFormData({ ...formData, discountPrice: text })}
                  placeholder="Nhập giá khuyến mãi"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      formData.categoryId === category.id && styles.selectedCategoryChip
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: category.id })}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.categoryId === category.id && styles.selectedCategoryChipText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Nhà xuất bản</Text>
                <TextInput
                  style={styles.input}
                  value={formData.publisher}
                  onChangeText={(text) => setFormData({ ...formData, publisher: text })}
                  placeholder="Nhập nhà xuất bản"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Số trang</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pageCount}
                  onChangeText={(text) => setFormData({ ...formData, pageCount: text })}
                  placeholder="Nhập số trang"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày xuất bản</Text>
              <TextInput
                style={styles.input}
                value={formData.publicationDate}
                onChangeText={(text) => setFormData({ ...formData, publicationDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Hoạt động</Text>
                <Switch
                  value={formData.status === 'active'}
                  onValueChange={(value) => setFormData({ ...formData, status: value ? 'active' : 'inactive' })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tính năng đặc biệt</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Nổi bật</Text>
                <Switch
                  value={formData.isFeatured}
                  onValueChange={(value) => setFormData({ ...formData, isFeatured: value })}
                />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Bán chạy</Text>
                <Switch
                  value={formData.isBestseller}
                  onValueChange={(value) => setFormData({ ...formData, isBestseller: value })}
                />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mới phát hành</Text>
                <Switch
                  value={formData.isNewRelease}
                  onValueChange={(value) => setFormData({ ...formData, isNewRelease: value })}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editingBook ? 'Cập nhật sách' : 'Tạo sách'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  booksList: {
    flex: 1,
    padding: 20,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  bookCategory: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#991B1B',
  },
  featuredBadge: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  bookActions: {
    flexDirection: 'column',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
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
    padding: 20,
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
    padding: 20,
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
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#374151',
  },
  selectedCategoryChipText: {
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

export default ManageBooksScreen;


