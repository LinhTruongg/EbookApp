import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, SafeAreaView, ScrollView, Switch } from 'react-native';
import { apiService } from '../../../services/api';
import { Author } from '../../../types';

const ManageAuthorsScreen: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filtered, setFiltered] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    avatar: '',
    birthDate: '',
    nationality: '',
    website: '',
    isActive: true,
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(authors);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        authors.filter(a =>
          (a.name || '').toLowerCase().includes(q) ||
          (a.nationality || '').toLowerCase().includes(q)
        )
      );
    }
  }, [authors, search]);

  const resetForm = () => {
    setForm({ name: '', bio: '', avatar: '', birthDate: '', nationality: '', website: '', isActive: true });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (author: Author) => {
    setEditing(author);
    setForm({
      name: author.name || '',
      bio: (author as any).bio || author.biography || '',
      avatar: author.avatar || '',
      birthDate: author.birthDate || '',
      nationality: author.nationality || '',
      website: author.website || '',
      isActive: author.isActive,
    });
    setModalVisible(true);
  };

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllAuthorsAdmin();
      if (response.success) {
        setAuthors(response.data || []);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách tác giả');
      }
    } catch (e) {
      console.error('Load authors error:', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuthors();
    setRefreshing(false);
  };

  const handleDelete = async (author: Author) => {
    Alert.alert('Xóa tác giả', `Bạn có chắc muốn xóa "${author.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            const res = await apiService.deleteAuthor(String(author.id));
            if (res.success) {
              await loadAuthors();
            } else {
              Alert.alert('Lỗi', res.message || 'Không thể xóa tác giả');
            }
          } catch (e) {
            Alert.alert('Lỗi', 'Không thể xóa tác giả');
          }
        }
      }
    ]);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        Alert.alert('Lỗi', 'Tên tác giả là bắt buộc');
        return;
      }
      if (editing) {
        const res = await apiService.updateAuthor(String(editing.id), form as any);
        if (!res.success) return Alert.alert('Lỗi', res.message || 'Cập nhật thất bại');
      } else {
        const res = await apiService.createAuthor(form as any);
        if (!res.success) return Alert.alert('Lỗi', res.message || 'Tạo thất bại');
      }
      setModalVisible(false);
      resetForm();
      await loadAuthors();
    } catch (e) {
      Alert.alert('Lỗi', editing ? 'Không thể cập nhật tác giả' : 'Không thể tạo tác giả');
    }
  };

  const renderItem = ({ item }: { item: Author }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSub}>
          {(item.nationality || 'Không rõ')} · {(item.birthDate || 'N/A')}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
            {item.isActive ? 'Hoạt động' : 'Ngừng' }
          </Text>
          <Text style={styles.countText}>Sách: {item.bookCount ?? item.booksCount ?? 0}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.btnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.btnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm tác giả..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Thêm tác giả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.modalTitle}>{editing ? 'Cập nhật tác giả' : 'Thêm tác giả'}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tiểu sử</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={form.bio}
                onChangeText={(v) => setForm({ ...form, bio: v })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.col]}>
                <Text style={styles.label}>Quốc tịch</Text>
                <TextInput style={styles.input} value={form.nationality} onChangeText={(v) => setForm({ ...form, nationality: v })} />
              </View>
              <View style={[styles.formGroup, styles.col]}>
                <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={form.birthDate} onChangeText={(v) => setForm({ ...form, birthDate: v })} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput style={styles.input} value={form.website} onChangeText={(v) => setForm({ ...form, website: v })} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Hoạt động</Text>
                <Switch value={form.isActive} onValueChange={(v) => setForm({ ...form, isActive: v })} />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{editing ? 'Cập nhật' : 'Tạo mới'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flex: 1, marginRight: 12 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#f9f9f9', height: 40 },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, height: 40, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16 },
  item: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSub: { fontSize: 14, color: '#666', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600', marginRight: 8 },
  badgeActive: { backgroundColor: '#d4edda', color: '#155724' },
  badgeInactive: { backgroundColor: '#f8d7da', color: '#721c24' },
  countText: { fontSize: 12, color: '#666' },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#3B82F6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', minWidth: 60 },
  deleteBtn: { backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', minWidth: 60 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalBody: { padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#fff' },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  switchRow: { marginTop: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  switchText: { fontSize: 14, color: '#333' },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ManageAuthorsScreen;


