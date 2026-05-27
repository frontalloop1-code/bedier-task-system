import axios from 'axios';

const TOKEN_KEY = 'bedier_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// In dev: Vite proxies /api → http://localhost:4000.
// In production: set VITE_API_BASE_URL=https://<your-backend-host>/api in your
// Netlify environment variables and rebuild. Falls back to relative /api so
// local dev still works without any env vars.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL });

export const uploadsBase =
  import.meta.env.VITE_UPLOADS_BASE_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '/uploads')
    : '/uploads');

api.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      tokenStore.clear();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
