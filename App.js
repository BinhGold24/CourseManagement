import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CourseListScreen from './screens/CourseListScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import CourseFormScreen from './screens/CourseFormScreen';
import CategoryScreen from './screens/CategoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CourseList"
        screenOptions={{
          headerStyle: { backgroundColor: '#0066cc' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="CourseList"
          component={CourseListScreen}
          options={({ navigation }) => ({
            title: 'Quản lý khóa học',
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => navigation.navigate('Category')}
                >
                  <Text style={styles.navBtnText}>Danh mục</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => navigation.navigate('CourseForm')}
                >
                  <Text style={styles.navBtnText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{ title: 'Chi tiết khóa học' }}
        />
        <Stack.Screen
          name="CourseForm"
          component={CourseFormScreen}
          options={({ route }) => ({
            title: route.params?.course ? 'Sửa khóa học' : 'Thêm khóa học mới',
          })}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={{ title: 'Quản lý danh mục' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
  },
  navBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});