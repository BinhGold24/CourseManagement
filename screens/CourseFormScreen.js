import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, addCourse, updateCourse } from '../api/api';

export default function CourseFormScreen({ route, navigation }) {
  const editCourse = route.params?.course;
  const isEditing = !!editCourse;

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState(editCourse?.title || '');
  const [description, setDescription] = useState(editCourse?.description || '');
  const [categoryId, setCategoryId] = useState(editCourse?.categoryId || '');
  const [instructor, setInstructor] = useState(editCourse?.instructor || '');
  const [price, setPrice] = useState(editCourse ? String(editCourse.price) : '');
  const [duration, setDuration] = useState(editCourse ? String(editCourse.duration) : '');
  const [thumbnail, setThumbnail] = useState(editCourse?.thumbnail || '');
  const [trailerUrl, setTrailerUrl] = useState(editCourse?.trailerUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data);
        if (!isEditing && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      })
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh mục!'));
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !instructor.trim() || !description.trim()) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng điền đầy đủ: Tên khóa học, Giảng viên và Mô tả.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng chọn danh mục hợp lệ.');
      return;
    }
    const numPrice = Number(price);
    const numDuration = Number(duration);
    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Lỗi nhập liệu', 'Học phí phải là số và không được âm (>= 0).');
      return;
    }
    if (isNaN(numDuration) || numDuration <= 0) {
      Alert.alert('Lỗi nhập liệu', 'Thời lượng phải là số lớn hơn 0.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructor: instructor.trim(),
      price: numPrice,
      duration: numDuration,
      thumbnail: thumbnail.trim(),
      trailerUrl: trailerUrl.trim(),
      createdAt: editCourse?.createdAt || new Date().toISOString().split('T')[0],
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateCourse(editCourse.id, payload);
        Alert.alert('Thành công', 'Đã cập nhật khóa học!');
      } else {
        await addCourse(payload);
        Alert.alert('Thành công', 'Đã thêm khóa học mới!');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu khóa học lên hệ thống.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tên khóa học (*)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Lập trình React Native"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Danh mục (*)</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(val) => setCategoryId(val)}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Giảng viên (*)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Nguyễn Văn A"
        value={instructor}
        onChangeText={setInstructor}
      />

      <Text style={styles.label}>Học phí (VNĐ) (*)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 500000"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={styles.label}>Thời lượng (giờ) (*)</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 30"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.label}>URL ảnh bìa (Thumbnail)</Text>
      <TextInput
        style={styles.input}
        placeholder="Dán link ảnh https://..."
        value={thumbnail}
        onChangeText={setThumbnail}
      />
      {thumbnail.trim() ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Xem trước ảnh:</Text>
          <Image source={{ uri: thumbnail.trim() }} style={styles.preview} />
        </View>
      ) : null}

      <Text style={styles.label}>URL Trailer (MP4 hoặc link YouTube)</Text>
      <TextInput
        style={styles.input}
        placeholder="Dán link video MP4 hoặc link YouTube"
        value={trailerUrl}
        onChangeText={setTrailerUrl}
      />

      <Text style={styles.label}>Mô tả chi tiết (*)</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Nội dung mô tả khóa học..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>{isEditing ? 'Lưu thay đổi' : 'Thêm mới'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  preview: { width: '100%', height: 160, borderRadius: 8, backgroundColor: '#eee' },
  submitBtn: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 50,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});