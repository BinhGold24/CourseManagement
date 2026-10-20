import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCourses,
} from '../api/api';

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resCat, resCourses] = await Promise.all([
        getCategories(),
        getCourses(),
      ]);
      setCategories(resCat.data);
      setCourses(resCourses.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (category = null) => {
    setEditingCat(category);
    setName(category ? category.name : '');
    setDescription(category ? category.description : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống!');
      return;
    }
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await addCategory({
          name: name.trim(),
          description: description.trim(),
        });
      }
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu danh mục.');
    }
  };

  const handleDelete = (catId) => {
    // Ràng buộc phía app: kiểm tra nếu đang có khóa học mang categoryId này
    const hasCourse = courses.some((c) => String(c.categoryId) === String(catId));
    if (hasCourse) {
      Alert.alert(
        'Không thể xóa',
        'Danh mục này đang có khóa học liên kết. Bạn cần xóa hoặc chuyển các khóa học sang danh mục khác trước!'
      );
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa danh mục này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(catId);
            loadData();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa danh mục.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
        <Text style={styles.addBtnText}>+ Thêm danh mục mới</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => openModal(item)}>
                <Text style={styles.editText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal Thêm / Sửa */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên danh mục (*)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Mô tả danh mục"
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#888' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#0066cc' }]}
                onPress={handleSave}
              >
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemDesc: { fontSize: 13, color: '#666', marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  editText: { color: '#0066cc', fontWeight: 'bold' },
  deleteText: { color: '#d32f2f', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
});