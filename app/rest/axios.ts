import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Ensure proper headers for FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  }
);

// Fetch data
export const fetchData = async <T>(config: AxiosRequestConfig): Promise<T> => {
  //   config.url = config.url!.replace(/^\/Api/, '/api');
  const response = await api.request<T>({
    ...config,
  });
  return response?.data;
};
