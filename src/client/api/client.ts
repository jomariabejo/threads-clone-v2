import axios from 'axios';
import { store } from '@/client/redux/store';
import { logout } from '@/client/redux/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8082';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const { token } = store.getState().auth;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Backend-v2 returns relative `/media/...` URLs; prefix them with the API base
// so they can be used directly in `<img>`/`<video>` `src` attributes.
export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
