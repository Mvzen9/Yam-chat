import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';

import { AuthResponse, LoginRequest, Message, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://todo-app.polandcentral.cloudapp.azure.com:5005';
const AUTH_BASE_URL = 'http://todo-app.polandcentral.cloudapp.azure.com:5004/api';

// ✅ Axios Instances
const api = axios.create({ baseURL: API_BASE_URL });
const authApi = axios.create({ baseURL: AUTH_BASE_URL });

// ✅ Request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authApi.post<{ token: string }>('/Auth/refresh', { refreshToken });
          const { token } = response.data;
          localStorage.setItem('token', token);

          if (error.config) {
            error.config.headers = {
              ...error.config.headers,
              Authorization: `Bearer ${token}`,
            };
            return api.request(error.config);
          }
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth Endpoints
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    authApi.post<AuthResponse>('/Auth/login', credentials).then(res => res.data),
};

// ✅ Chat Endpoints
export const chatAPI = {
  getHistory: (recipientId: string): Promise<Message[]> =>
    api.get<Message[]>(`/api/Chat/history/${recipientId}`).then(res => res.data),

  sendMessage: (text: string, recipientId: string): Promise<void> => {
    const now = new Date().toISOString();

    const senderId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (!senderId) {
      console.error("❌ Sender ID not found in localStorage");
      return Promise.reject("Sender ID not found");
    }

    return api.post<void>('/api/Chat/send', {
      text,
      recipientId,
      sentAt: now,
      isRead: false,
      senderId
    }).then(() => {});
  },

  markAsRead: (messageId: number): Promise<void> =>
    api.put<void>(`/api/Chat/read/${messageId}`).then(() => {}),
};

// ✅ User Endpoints
export const userAPI = {
  getAllUsers: (): Promise<User[]> =>
    api.get<User[]>('/api/User').then(res => res.data),

  searchUsers: (name: string): Promise<User[]> =>
    api.get<User[]>(`/api/User/search?name=${encodeURIComponent(name)}`).then(res => res.data),

  getUser: (userId: string): Promise<User> =>
    api.get<User>(`/api/User/${userId}`).then(res => res.data),
};

export default api;
