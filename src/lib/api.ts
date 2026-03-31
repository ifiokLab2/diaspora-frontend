import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// Base URL for the Django Backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 1. REQUEST INTERCEPTOR
 * Attaches the Access Token to every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 2. RESPONSE INTERCEPTOR
 * Intercepts 401 errors to attempt a token refresh.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    
    const originalRequest = error.config;
    // 1. Define login endpoints to skip refresh logic
    const isLoginRequest = originalRequest.url.includes('/login/seller/') || 
                          originalRequest.url.includes('/login/customer/');

    // Check if error is 401 and we haven't tried refreshing yet
                          // 2. Only attempt refresh if it's a 401 AND NOT a login request
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        // Retrieve the Refresh Token from Cookies
        const refreshToken = getCookie('refreshToken');
        
        if (!refreshToken) {
          // If no refresh token exists, we cannot refresh; throw to catch block
          throw new Error("No refresh token available");
        }

        // Attempt to get a new Access Token from Django
        // Note: We use a separate axios instance to avoid infinite loops
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          const { access } = res.data;

          // Update the Access Token cookie (1 day expiry)
          setCookie('accessToken', access, { maxAge: 60 * 60 * 24, path: '/' });
          
          // Update the failed request header and retry it
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing fails (token expired or invalid), clear the session
        deleteCookie('accessToken', { path: '/' });
        deleteCookie('refreshToken', { path: '/' });
        deleteCookie('userRole', { path: '/' });
        deleteCookie('hasProfile', { path: '/' });
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_data');
          // Redirect to login based on the current context if needed
          // window.location.href = '/login/seller';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;