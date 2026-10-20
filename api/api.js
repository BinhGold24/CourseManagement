import axios from 'axios';

const BASE_URL = 'https://6ad6b796f71f154ac486f260.mockapi.io/api/v1';
const COURSES_RESOURCE = '/photo';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Categories API
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Courses API
export const getCourses = () => api.get(COURSES_RESOURCE);
export const getCourseById = (id) => api.get(`${COURSES_RESOURCE}/${id}`);
export const addCourse = (data) => api.post(COURSES_RESOURCE, data);
export const updateCourse = (id, data) => api.put(`${COURSES_RESOURCE}/${id}`, data);
export const deleteCourse = (id) => api.delete(`${COURSES_RESOURCE}/${id}`);

export default api;