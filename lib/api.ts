import axios from 'axios';

// Get API base URL from environment variable or fallback to local
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token if present
api.interceptors.request.use(
  (config) => {
    // In Next.js, localStorage is only available in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('urbaniq_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Clear all auth data from localStorage and redirect to login.
 * Called when refresh fails or session is completely invalid.
 */
const clearSessionAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('urbaniq_token');
    localStorage.removeItem('urbaniq_refresh_token');
    localStorage.removeItem('urbaniq_user');
    window.location.href = '/login';
  }
};

// Track whether a token refresh is already in progress to avoid parallel refresh calls
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
};

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth routes — login/google auth errors should surface to the UI directly
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/google') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/verify-otp');

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // If the refresh endpoint itself failed → session is completely dead, clear and redirect
    if (originalRequest.url?.includes('/auth/refresh')) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        let rt = null;
        if (typeof window !== 'undefined') {
          rt = localStorage.getItem('urbaniq_refresh_token');
        }

        if (!rt) {
          clearSessionAndRedirect();
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: rt },
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken || res.data.token;
        const newRefreshToken = res.data.refreshToken;

        if (typeof window !== 'undefined') {
          if (newAccessToken) localStorage.setItem('urbaniq_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('urbaniq_refresh_token', newRefreshToken);
        }

        processQueue(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue = [];
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
