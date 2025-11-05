import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const documentService = {
  getDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`),
  createDocument: (title, content = '') =>
    api.post('/documents', { title, content }),
  updateDocument: (id, data) =>
    api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  shareDocument: (id) => api.post(`/documents/${id}/share`),
  getDocumentByShareLink: (shareLink) =>
    api.get(`/documents/share/${shareLink}`)
};

export const aiService = {
  grammarCheck: (text) => api.post('/ai/grammar-check', { text }),
  enhance: (text) => api.post('/ai/enhance', { text }),
  summarize: (text) => api.post('/ai/summarize', { text }),
  complete: (text, context = '') => api.post('/ai/complete', { text, context }),
  getSuggestions: (text, type = 'general') =>
    api.post('/ai/suggestions', { text, type })
};

export default api;

