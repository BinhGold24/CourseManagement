import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getCourseById, getCategories, deleteCourse } from '../api/api';

function Mp4Trailer({ uri }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.media}
      nativeControls
      contentFit="contain"
    />
  );
}

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    loadCourseDetail();
  }, []);

  const loadCourseDetail = async () => {
    try {
      const [resCourse, resCat] = await Promise.all([
        getCourseById(courseId),
        getCategories(),
      ]);
      setCourse(resCourse.data);
      const cat = resCat.data.find(
        (c) => String(c.id) === String(resCourse.data.categoryId)
      );
      setCategoryName(cat ? cat.name : 'Không xác định');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin chi tiết khóa học!');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa khóa học này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(courseId);
              Alert.alert('Thành công', 'Đã xóa khóa học thành công!');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa khóa học.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!course) return null;

  const ytId = getYouTubeId(course.trailerUrl);

  return (
    <ScrollView style={styles.container}>
      {/* Khung hiển thị Media: Ảnh hoặc Video */}
      {showVideo && course.trailerUrl ? (
        isYouTubeUrl(course.trailerUrl) && ytId ? (
          <View style={{ height: 230, backgroundColor: '#000' }}>
            <YoutubePlayer height={230} play={true} videoId={ytId} />
          </View>
        ) : (
          <Mp4Trailer uri={course.trailerUrl} />
        )
      ) : (
        <Image
          source={{ uri: course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500' }}
          style={styles.media}
        />
      )}

      {course.trailerUrl ? (
        <TouchableOpacity
          style={styles.videoToggleBtn}
          onPress={() => setShowVideo(!showVideo)}
        >
          <Text style={styles.videoToggleText}>
            {showVideo ? 'Ẩn Trailer' : '▶ Xem Trailer'}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.price}>
          {Number(course.price || 0).toLocaleString('vi-VN')} đ
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Giảng viên:</Text>
          <Text style={styles.val}>{course.instructor}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Danh mục:</Text>
          <Text style={styles.val}>{categoryName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời lượng:</Text>
          <Text style={styles.val}>{course.duration} giờ</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.val}>{course.createdAt || 'N/A'}</Text>
        </View>

        <Text style={styles.descTitle}>Mô tả khóa học</Text>
        <Text style={styles.desc}>{course.description}</Text>

        {/* Nút hành động Sửa & Xóa */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.editBtn]}
            onPress={() => navigation.navigate('CourseForm', { course })}
          >
            <Text style={styles.btnText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.deleteBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  media: { width: '100%', height: 230, backgroundColor: '#000' },
  videoToggleBtn: {
    backgroundColor: '#ff9800',
    padding: 12,
    alignItems: 'center',
  },
  videoToggleText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 14 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 100, fontWeight: 'bold', color: '#666' },
  val: { flex: 1, color: '#333', fontSize: 15 },
  descTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  desc: { fontSize: 14, lineHeight: 22, color: '#444' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#0066cc' },
  deleteBtn: { backgroundColor: '#d32f2f' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});