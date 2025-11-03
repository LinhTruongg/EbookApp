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
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../../services/api';
import { Book, Category, Author } from '../../../types';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

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
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    isbn: '',
    categoryId: '',
    publisher: '',
    publicationDate: '',
    pageCount: '',
    language: 'vi',
    authorIds: [] as string[],
    isFeatured: false,
    isBestseller: false,
    isNewRelease: false,
    isLockedByPoints: false,
    pointsRequired: '0',
  });

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size: number;
    type: string;
  } | null>(null);

  const [selectedCoverImage, setSelectedCoverImage] = useState<{
    name: string;
    uri: string;
    size: number;
    type: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [authorsDropdownOpen, setAuthorsDropdownOpen] = useState(false);

  useEffect(() => {
    loadData();
    if (route?.params?.editBook) {
      setEditingBook(route.params.editBook);
      setFormData({
        title: route.params.editBook.title,
        subtitle: route.params.editBook.subtitle || '',
        description: route.params.editBook.description,
        isbn: route.params.editBook.isbn || '',
        // Removed price fields as this is now a free reading app
        categoryId: route.params.editBook.categoryId?.toString() || '',
        publisher: route.params.editBook.publisher || '',
        publicationDate: route.params.editBook.publicationDate || '',
        pageCount: route.params.editBook.pageCount?.toString() || '',
        language: route.params.editBook.language || 'vi',
        authorIds: route.params.editBook.authors?.map(a => a.id) || [],
        isFeatured: route.params.editBook.isFeatured || false,
        isBestseller: route.params.editBook.isBestseller || false,
        isNewRelease: route.params.editBook.isNewRelease || false,
      });
      
      // Set existing cover image if available
      if (route.params.editBook.coverImage) {
        setSelectedCoverImage({
          name: `cover_${route.params.editBook.id}.jpg`,
          uri: route.params.editBook.coverImage,
          size: 0,
          type: 'image/jpeg',
        });
      }
      setModalVisible(true);
    }
  }, [route?.params?.editBook]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksResponse, categoriesResponse, authorsResponse] = await Promise.all([
        apiService.getAllBooksAdmin(),
        apiService.getAllCategories(),
        apiService.getAllAuthorsAdmin(),
      ]);

      if (booksResponse.success) {
        setBooks(booksResponse.data || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      if (authorsResponse.success) {
        setAuthors(authorsResponse.data || []);
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

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        (book.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.isbn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.authors?.[0]?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const pickBookFile = async () => {
    try {
      console.log('📂 Opening file picker...');

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook', 'text/plain'],
        copyToCacheDirectory: true,
      }) as any;

      console.log('📂 File picker result:', JSON.stringify(result, null, 2));

      // The newer API always returns an object with 'canceled' and 'assets' properties
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('✅ File selected:', asset);

        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          size: asset.size || 0,
          type: asset.mimeType || 'application/octet-stream',
        });

        Alert.alert('✅ Thành công', `Đã chọn file: ${asset.name}`);
      } else if (result.canceled) {
        console.log('❌ User cancelled file picker');
      } else {
        console.warn('⚠️ Unexpected file picker result:', result);
        Alert.alert('⚠️ Lỗi', 'Không thể xử lý file. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ File picker error:', error);
      Alert.alert('❌ Lỗi', `Không thể chọn file. Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const pickCoverImage = async () => {
    try {
      console.log('🖼️ Opening image picker...');

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('⚠️ Cần quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh bìa sách.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Tỷ lệ 3:4 cho ảnh bìa sách
        quality: 0.8,
        base64: false,
      });

      console.log('🖼️ Image picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('✅ Image selected:', asset);

        setSelectedCoverImage({
          name: `cover_${Date.now()}.jpg`,
          uri: asset.uri,
          size: asset.fileSize || 0,
          type: 'image/jpeg',
        });

        Alert.alert('✅ Thành công', 'Đã chọn ảnh bìa sách');
      } else if (result.canceled) {
        console.log('❌ User cancelled image picker');
      } else {
        console.warn('⚠️ Unexpected image picker result:', result);
        Alert.alert('⚠️ Lỗi', 'Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('❌ Lỗi', `Không thể chọn ảnh. Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      isbn: '',
      categoryId: '',
      publisher: '',
      publicationDate: '',
      pageCount: '',
      language: 'vi',
      authorIds: [],
      isFeatured: false,
      isBestseller: false,
      isNewRelease: false,
      isLockedByPoints: false,
      pointsRequired: '0',
    });
    setSelectedFile(null);
    setSelectedCoverImage(null);
    setEditingBook(null);
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    console.log('🔍 Starting form submission...');
    console.log('📋 Form data:', formData);
    console.log('📁 Selected file:', selectedFile);
    console.log('📁 Is selectedFile null?', selectedFile === null);
    console.log('📁 Is selectedFile undefined?', selectedFile === undefined);
    console.log('📁 selectedFile truthy?', !!selectedFile);

    // Validate required fields
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('• Tiêu đề sách');
    }

    if (!formData.description.trim()) {
      errors.push('• Mô tả sách');
    }

    // Check categoryId - ensure it's a non-empty string
    const categoryIdStr = String(formData.categoryId || '').trim();
    if (!categoryIdStr) {
      errors.push('• Danh mục sách');
    }

    console.log('✓ Validation errors:', errors);
    console.log('ℹ️ CategoryId value:', formData.categoryId, 'Type:', typeof formData.categoryId);
    
    // Validate description length
    if (formData.description.trim() && formData.description.trim().length < 1) {
      errors.push('• Mô tả sách phải có ít nhất 1 ký tự');
    }
    
    // Validate title length
    if (formData.title.trim() && formData.title.trim().length < 1) {
      errors.push('• Tiêu đề sách phải có ít nhất 1 ký tự');
    }
    
    // Validate points when locked by points
    if (formData.isLockedByPoints) {
      const pts = Number(formData.pointsRequired || '0');
      if (!Number.isFinite(pts) || pts < 0) {
        errors.push('• Số điểm yêu cầu phải là số không âm');
      }
    }

    // Validate ISBN format if provided
    if (formData.isbn.trim() && (formData.isbn.trim().length < 10 || formData.isbn.trim().length > 20)) {
      errors.push('• ISBN phải từ 10-20 ký tự');
    }
    
    // Validate page count if provided
    if (formData.pageCount && (isNaN(parseInt(formData.pageCount)) || parseInt(formData.pageCount) < 1)) {
      errors.push('• Số trang phải là số dương');
    }
    
    // Validate publication date format if provided
    if (formData.publicationDate && formData.publicationDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.publicationDate.trim())) {
        errors.push('• Ngày xuất bản phải có định dạng YYYY-MM-DD');
      }
    }

    // Validate file is provided when creating new book (not required for updates)
    if (!editingBook && !selectedFile) {
      errors.push('• Tệp sách là bắt buộc khi tạo sách mới');
    }

    if (errors.length > 0) {
      console.log('❌ Validation failed with errors:', errors);
      // Set validation errors for visual feedback
      const fieldErrors: {[key: string]: string} = {};
      if (!formData.title.trim()) fieldErrors.title = 'Tiêu đề sách là bắt buộc';
      if (!formData.description.trim()) fieldErrors.description = 'Mô tả sách là bắt buộc';
      const categoryIdStr = String(formData.categoryId || '').trim();
      if (!categoryIdStr) fieldErrors.categoryId = 'Danh mục sách là bắt buộc';
      if (!editingBook && !selectedFile) fieldErrors.file = 'Tệp sách là bắt buộc';

      setValidationErrors(fieldErrors);

      Alert.alert(
        '⚠️ Thông tin không hợp lệ',
        'Vui lòng kiểm tra lại các thông tin sau:\n\n' + errors.join('\n'),
        [{ text: 'Đóng', style: 'default' }]
      );
      return;
    }

    console.log('✅ Validation passed! Proceeding with submission...');
    // Clear validation errors if all fields are valid
    setValidationErrors({});

    try {
      console.log('⏳ Setting isSubmitting to true');
      setIsSubmitting(true);

      // Prepare data - use FormData if there's a file, otherwise use regular object
      let submitData: any;

      if (selectedFile) {
        console.log('📤 Preparing FormData with file...');
        console.log('✅ selectedFile exists:', {
          name: selectedFile.name,
          uri: selectedFile.uri,
          type: selectedFile.type,
          size: selectedFile.size,
          hasMissingProps: !selectedFile.name || !selectedFile.uri || !selectedFile.type
        });

        // Use FormData for file upload
        submitData = new FormData();
        submitData.append('title', formData.title.trim());
        if (formData.subtitle.trim()) submitData.append('subtitle', formData.subtitle.trim());
        submitData.append('description', formData.description.trim());
        if (formData.isbn.trim()) submitData.append('isbn', formData.isbn.trim());
        submitData.append('categoryId', formData.categoryId);
        if (formData.publisher.trim()) submitData.append('publisher', formData.publisher.trim());
        if (formData.publicationDate) submitData.append('publicationDate', formData.publicationDate);
        if (formData.pageCount) submitData.append('pageCount', formData.pageCount);
        submitData.append('language', formData.language);

        // Add authorIds as JSON string
        const authorIds = (formData.authorIds || [])
          .map((id) => parseInt(String(id), 10))
          .filter((n) => Number.isFinite(n));
        if (authorIds.length > 0) {
          submitData.append('authorIds', JSON.stringify(authorIds));
        }

        submitData.append('isFeatured', formData.isFeatured.toString());
        submitData.append('isBestseller', formData.isBestseller.toString());
        submitData.append('isNewRelease', formData.isNewRelease.toString());
        submitData.append('isLockedByPoints', formData.isLockedByPoints.toString());
        submitData.append('pointsRequired', String(Number(formData.pointsRequired || '0')));

        // Add file - IMPORTANT: For React Native/Expo FormData
        // Must send file as a proper file object with uri, type, and name
        console.log('📁 Appending file to FormData');
        console.log('📁 File details:', {
          name: selectedFile.name,
          type: selectedFile.type,
          uri: selectedFile.uri,
          size: selectedFile.size
        });

        // Read file as Base64 to store directly in database
        console.log('🔐 Reading file as Base64 for database storage...');
        let fileBase64: string;

        try {
          if (selectedFile.uri.startsWith('blob:')) {
            // Handle web blob - fetch and convert to Base64
            console.log('🌐 Detected web blob URL - fetching and converting to Base64');
            const response = await fetch(selectedFile.uri);
            const blobData = await response.blob();
            // Convert blob to Base64
            const reader = new FileReader();
            fileBase64 = await new Promise((resolve, reject) => {
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blobData);
            });
            console.log('✅ Web blob converted to Base64:', { size: fileBase64.length, preview: fileBase64.substring(0, 50) + '...' });
          } else {
            // For React Native, read file from URI as Base64
            console.log('📱 Reading React Native file as Base64:', selectedFile.uri);
            fileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
              encoding: 'base64',
            });
            console.log('✅ File read as Base64:', { size: fileBase64.length, preview: fileBase64.substring(0, 50) + '...' });
          }
        } catch (error) {
          console.error('❌ Error reading file as Base64:', error);
          throw new Error('Failed to read file');
        }

        // Append file data as Base64
        console.log('📁 Appending Base64 file data to FormData');
        submitData.append('fileBase64', fileBase64);
        submitData.append('fileName', selectedFile.name);
        submitData.append('fileType', selectedFile.type);
        submitData.append('fileSize', selectedFile.size.toString());

        // Add cover image if selected
        if (selectedCoverImage) {
          console.log('🖼️ Adding cover image to FormData');
          try {
            let coverImageBase64: string;
            if (selectedCoverImage.uri.startsWith('blob:')) {
              // Handle web blob
              const response = await fetch(selectedCoverImage.uri);
              const blobData = await response.blob();
              const reader = new FileReader();
              coverImageBase64 = await new Promise((resolve, reject) => {
                reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1];
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blobData);
              });
            } else {
              // For React Native
              coverImageBase64 = await FileSystem.readAsStringAsync(selectedCoverImage.uri, {
                encoding: 'base64',
              });
            }
            
            submitData.append('coverImageBase64', coverImageBase64);
            submitData.append('coverImageName', selectedCoverImage.name);
            submitData.append('coverImageType', selectedCoverImage.type);
            submitData.append('coverImageSize', selectedCoverImage.size.toString());
            console.log('✅ Cover image added to FormData');
          } catch (error) {
            console.error('❌ Error reading cover image:', error);
            Alert.alert('⚠️ Cảnh báo', 'Không thể đọc ảnh bìa. Sách sẽ được tạo không có ảnh bìa.');
          }
        }

        console.log('✅ FormData prepared with Base64 file data');
        console.log('📋 FormData entries:');
        for (const [key, value] of (submitData as any).entries()) {
          if (key === 'fileBase64') {
            console.log(`  - ${key}:`, `Base64 (${value.length} chars)`);
          } else {
            console.log(`  - ${key}:`, value);
          }
        }
      } else {
        console.log('📝 Preparing regular JSON data (no file)...');
        // Use regular object if no file
        submitData = {
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim() || undefined,
          description: formData.description.trim(),
          isbn: formData.isbn.trim() || undefined,
          categoryId: parseInt(formData.categoryId),
          publisher: formData.publisher.trim() || undefined,
          publicationDate: formData.publicationDate || undefined,
          pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
          language: formData.language,
          authorIds: (formData.authorIds || [])
            .map((id) => parseInt(String(id), 10))
            .filter((n) => Number.isFinite(n)),
          isFeatured: formData.isFeatured,
          isBestseller: formData.isBestseller,
          isNewRelease: formData.isNewRelease,
          isLockedByPoints: formData.isLockedByPoints,
          pointsRequired: Number(formData.pointsRequired || '0'),
        };

        // Add cover image if selected (for JSON data, we'll need to handle it differently)
        if (selectedCoverImage) {
          console.log('🖼️ Adding cover image to JSON data');
          try {
            let coverImageBase64: string;
            if (selectedCoverImage.uri.startsWith('blob:')) {
              // Handle web blob
              const response = await fetch(selectedCoverImage.uri);
              const blobData = await response.blob();
              const reader = new FileReader();
              coverImageBase64 = await new Promise((resolve, reject) => {
                reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1];
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blobData);
              });
            } else {
              // For React Native
              coverImageBase64 = await FileSystem.readAsStringAsync(selectedCoverImage.uri, {
                encoding: 'base64',
              });
            }
            
            (submitData as any).coverImageBase64 = coverImageBase64;
            (submitData as any).coverImageName = selectedCoverImage.name;
            (submitData as any).coverImageType = selectedCoverImage.type;
            (submitData as any).coverImageSize = selectedCoverImage.size.toString();
            console.log('✅ Cover image added to JSON data');
          } catch (error) {
            console.error('❌ Error reading cover image:', error);
            Alert.alert('⚠️ Cảnh báo', 'Không thể đọc ảnh bìa. Sách sẽ được tạo không có ảnh bìa.');
          }
        }

        console.log('✅ JSON data prepared:', submitData);
      }

      if (editingBook) {
        console.log('🔄 Updating existing book:', editingBook.id);
        const response = await apiService.updateBook(editingBook.id, submitData);
        console.log('📨 Update response:', response);
        if (response.success) {
          Alert.alert('✅ Thành công', 'Cập nhật sách thành công');
          setModalVisible(false);
          resetForm();
          loadData();
        } else {
          Alert.alert('❌ Lỗi', response.message || 'Không thể cập nhật sách');
        }
      } else {
        console.log('➕ Creating new book');
        const response = await apiService.createBook(submitData);
        console.log('📨 Create response:', response);
        if (response.success) {
          Alert.alert('✅ Thành công', 'Tạo sách thành công');
          setModalVisible(false);
          resetForm();
          loadData();
        } else {
          Alert.alert('❌ Lỗi', response.message || 'Không thể tạo sách');
        }
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('❌ Lỗi', `Có lỗi xảy ra: ${errorMessage}`);
    } finally {
      console.log('✓ Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleDelete = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      setDeletingId(bookToDelete.id);
      const response = await apiService.deleteBook(bookToDelete.id);
      if (response.success) {
        Alert.alert('✅ Thành công', response.message || 'Xóa sách thành công');
        loadData();
      } else {
        Alert.alert('❌ Lỗi', response.message || 'Không thể xóa sách');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra khi xóa sách');
    } finally {
      setDeletingId(null);
      setDeleteDialogVisible(false);
      setBookToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setBookToDelete(null);
  };


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
        <Text style={styles.bookAccess}>
          📖 Đọc miễn phí
        </Text>
        <View style={styles.bookMeta}>
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
              // Removed price fields as this is now a free reading app
              categoryId: (item as any).categoryId?.toString() || '',
              publisher: item.publisher || '',
              publicationDate: item.publicationDate || '',
              pageCount: item.pageCount?.toString() || '',
              language: item.language || 'vi',
              authorIds: item.authors?.map(a => a.id) || [],
              isFeatured: item.isFeatured || false,
              isBestseller: item.isBestseller || false,
              isNewRelease: item.isNewRelease || false,
            });
            
            // Set existing cover image if available
            if (item.coverImage) {
              setSelectedCoverImage({
                name: `cover_${item.id}.jpg`,
                uri: item.coverImage,
                size: 0,
                type: 'image/jpeg',
              });
            } else {
              setSelectedCoverImage(null);
            }
            
            setModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, deletingId === item.id && styles.disabledButton]}
          onPress={() => handleDelete(item)}
          disabled={deletingId === item.id}
        >
          <Text style={styles.deleteButtonText}>
            {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
          </Text>
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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sách..."
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
          <Text style={styles.addButtonText}>+ Thêm sách</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => String((item as any).id)}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Không tìm thấy sách nào' : 'Chưa có sách nào'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        accessibilityViewIsModal={true}
        accessibilityLabel="Form thêm/sửa sách"
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
              <Text style={styles.label}>🖼️ Ảnh bìa sách</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickCoverImage}
              >
                <Text style={styles.filePickerButtonText}>
                  {selectedCoverImage ? `✅ ${selectedCoverImage.name}` : '🖼️ Chọn ảnh bìa sách'}
                </Text>
              </TouchableOpacity>
              {selectedCoverImage && (
                <View style={styles.coverImageContainer}>
                  <Image
                    source={{ uri: selectedCoverImage.uri }}
                    style={styles.coverImagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.fileInfoContainer}>
                    <Text style={styles.fileInfoText}>
                      🖼️ {selectedCoverImage.name}
                    </Text>
                    <Text style={styles.fileInfoText}>
                      📦 {selectedCoverImage.size > 0 ? `${(selectedCoverImage.size / (1024 * 1024)).toFixed(2)} MB` : 'Kích thước không xác định'}
                    </Text>
                    <Text style={styles.fileInfoText}>
                      🏷️ {selectedCoverImage.type || 'Loại file không xác định'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('❌ Removing selected cover image');
                        setSelectedCoverImage(null);
                      }}
                      style={styles.removeFileButton}
                    >
                      <Text style={styles.removeFileButtonText}>Xóa ảnh bìa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.title && styles.inputError
                ]}
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (validationErrors.title) {
                    setValidationErrors({...validationErrors, title: ''});
                  }
                }}
                placeholder="Nhập tiêu đề sách"
                accessibilityLabel="Tiêu đề sách"
                accessibilityHint="Nhập tiêu đề của cuốn sách"
              />
              {validationErrors.title && (
                <Text style={styles.errorText}>{validationErrors.title}</Text>
              )}
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
                style={[
                  styles.input, 
                  styles.textArea,
                  validationErrors.description && styles.inputError
                ]}
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                  if (validationErrors.description) {
                    setValidationErrors({...validationErrors, description: ''});
                  }
                }}
                placeholder="Nhập mô tả sách"
                multiline
                numberOfLines={4}
                accessibilityLabel="Mô tả sách"
                accessibilityHint="Nhập mô tả chi tiết về cuốn sách"
              />
              {validationErrors.description && (
                <Text style={styles.errorText}>{validationErrors.description}</Text>
              )}
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

            {/* Removed price fields as this is now a free reading app */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Danh mục *</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                <Text style={styles.selectBoxText}>
                  {(() => {
                    const c = categories.find(c => String((c as any).id) === String(formData.categoryId));
                    return c ? c.name : 'Chọn danh mục...';
                  })()}
                </Text>
              </TouchableOpacity>
              {categoryDropdownOpen && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {categories.map((item) => {
                      const selected = String(formData.categoryId) === String((item as any).id);
                      return (
                        <TouchableOpacity
                          key={String((item as any).id)}
                          style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                          onPress={() => {
                            setFormData({ ...formData, categoryId: String((item as any).id) });
                            if (validationErrors.categoryId) setValidationErrors({ ...validationErrors, categoryId: '' });
                            setCategoryDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
              {validationErrors.categoryId && (
                <Text style={styles.errorText}>{validationErrors.categoryId}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tác giả</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setAuthorsDropdownOpen(!authorsDropdownOpen)}
              >
                <Text style={styles.selectBoxText}>
                  {formData.authorIds.length === 0
                    ? 'Chọn tác giả...'
                    : `${formData.authorIds.length} tác giả đã chọn`}
                </Text>
              </TouchableOpacity>
              {authorsDropdownOpen && (
                <View style={styles.dropdownContainer}>
                  <ScrollView style={{ maxHeight: 240 }}>
                    {authors.map((item) => {
                      const id = String((item as any).id);
                      const selected = formData.authorIds.includes(id);
                      return (
                        <TouchableOpacity
                          key={id}
                          style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                          onPress={() => {
                            const next = selected
                              ? formData.authorIds.filter(aid => aid !== id)
                              : [...formData.authorIds, id];
                            setFormData({ ...formData, authorIds: next });
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                              <Text style={styles.dropdownItemText}>{item.name}</Text>
                              {!!item.nationality && <Text style={styles.dropdownItemSub}>{item.nationality}</Text>}
                            </View>
                            <Text style={{ color: selected ? '#007AFF' : '#9CA3AF', fontWeight: '700' }}>{selected ? '✓' : '+'}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <TouchableOpacity style={styles.dropdownDoneButton} onPress={() => setAuthorsDropdownOpen(false)}>
                    <Text style={styles.dropdownDoneText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              )}
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
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Điểm yêu cầu</Text>
                <Switch
                  value={formData.isLockedByPoints}
                  onValueChange={(value) => setFormData({ ...formData, isLockedByPoints: value })}
                />
              </View>
              {formData.isLockedByPoints && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điểm yêu cầu</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.pointsRequired}
                    onChangeText={(text) => setFormData({ ...formData, pointsRequired: text.replace(/[^0-9]/g, '') })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>📁 Tệp sách (PDF, EPUB, MOBI, TXT) <Text style={styles.requiredAsterisk}>*</Text></Text>
              <TouchableOpacity
                style={[styles.filePickerButton, validationErrors.file && styles.filePickerButtonError]}
                onPress={pickBookFile}
              >
                <Text style={styles.filePickerButtonText}>
                  {selectedFile ? `✅ ${selectedFile.name}` : '📂 Chọn tệp sách'}
                </Text>
              </TouchableOpacity>
              {validationErrors.file && (
                <Text style={styles.errorText}>{validationErrors.file}</Text>
              )}
              {selectedFile && (
                <View style={styles.fileInfoContainer}>
                  <Text style={styles.fileInfoText}>
                    📄 {selectedFile.name}
                  </Text>
                  <Text style={styles.fileInfoText}>
                    📦 {selectedFile.size > 0 ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Kích thước không xác định'}
                  </Text>
                  <Text style={styles.fileInfoText}>
                    🏷️ {selectedFile.type || 'Loại file không xác định'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('❌ Removing selected file');
                      setSelectedFile(null);
                    }}
                    style={styles.removeFileButton}
                  >
                    <Text style={styles.removeFileButtonText}>Xóa file</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledSubmitButton]}
              onPress={() => {
                console.log('🔘 Submit button pressed!');
                console.log('isSubmitting:', isSubmitting);
                handleSubmit();
              }}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={editingBook ? 'Cập nhật sách' : 'Tạo sách'}
              accessibilityHint={editingBook ? 'Lưu thay đổi thông tin sách' : 'Tạo sách mới với thông tin đã nhập'}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingBook ? 'Cập nhật sách' : 'Tạo sách'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="🗑️ Xác nhận xóa sách"
        message={bookToDelete ? 
          `Bạn có chắc chắn muốn xóa sách "${bookToDelete.title}"?\n\n⚠️ Cảnh báo: Sách sẽ được xóa hoàn toàn khỏi hệ thống và không thể khôi phục.` 
          : ''
        }
        confirmText="🗑️ Xóa"
        cancelText="❌ Hủy"
        type="danger"
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
  bookItem: {
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
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookAccess: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  featuredBadge: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  bookActions: {
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
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
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
  selectBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectBoxText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dropdownDoneButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dropdownDoneText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  categoryChipError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  filePickerButton: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  filePickerButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  filePickerButtonError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '600',
  },
  fileInfoContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  fileInfoText: {
    fontSize: 13,
    color: '#374151',
    marginVertical: 4,
  },
  coverImageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  removeFileButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    alignItems: 'center',
  },
  removeFileButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledSubmitButton: {
    opacity: 0.6,
  },
});

export default ManageBooksScreen;
