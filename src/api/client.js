import axios from 'axios';

const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
const BASE_URL = (envUrl ? envUrl.replace(/\/$/, "") : 'http://localhost:8000');

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loops if refresh token endpoint itself returns 401
      if (originalRequest.url === '/auth/refresh') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; 
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Use axios directly instead of client to avoid interceptors on the refresh call
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (response.data?.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            if (response.data.refresh_token) {
               localStorage.setItem('refresh_token', response.data.refresh_token);
            }
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
