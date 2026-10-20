import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCourses, getCategories } from '../api/api';

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [resCourses, resCategories] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(resCourses.data);
      setCategories(resCategories.data);
      applyFilter(resCourses.data, search, selectedCategory);
    } catch (err) {
      alert('Lỗi tải dữ liệu từ máy chủ MockAPI!');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const applyFilter = (data, keyword, catId) => {
    let result = [...data];
    if (keyword && keyword.trim() !== '') {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    if (catId && catId !== '') {
      result = result.filter((c) => String(c.categoryId) === String(catId));
    }
    setFilteredCourses(result);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilter(courses, text, selectedCategory);
  };

  const handleSelectCategory = (catId) => {
    const nextCat = selectedCategory === catId ? '' : catId;
    setSelectedCategory(nextCat);
    applyFilter(courses, search, nextCat);
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => String(c.id) === String(catId));
    return cat ? cat.name : 'Chưa phân loại';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 10 }}>Đang tải khóa học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm khóa học theo tên..."
        value={search}
        onChangeText={handleSearch}
      />

      {/* Bộ lọc Danh mục */}
      <View style={{ maxHeight: 45, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.chip, selectedCategory === '' && styles.chipActive]}
            onPress={() => handleSelectCategory('')}
          >
            <Text style={selectedCategory === '' ? styles.chipTextActive : styles.chipText}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => handleSelectCategory(cat.id)}
            >
              <Text style={selectedCategory === cat.id ? styles.chipTextActive : styles.chipText}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Danh sách khóa học */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: '#888', marginTop: 40 }}>Không tìm thấy khóa học nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
          >
            <Image
              source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500' }}
              style={styles.cardThumb}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardInstructor}>GV: {item.instructor}</Text>
              <Text style={styles.cardCategory}>Danh mục: {getCategoryName(item.categoryId)}</Text>
              <Text style={styles.cardPrice}>
                {Number(item.price || 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#0066cc' },
  chipText: { color: '#333', fontSize: 13 },
  chipTextActive: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardThumb: { width: 110, height: 110, backgroundColor: '#eee' },
  cardContent: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  cardInstructor: { fontSize: 13, color: '#555' },
  cardCategory: { fontSize: 12, color: '#0066cc' },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#d32f2f' },
});