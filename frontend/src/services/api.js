import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API Contract and Handle Errors
api.interceptors.response.use(
  (response) => {
    // If the backend returned { success, message, data }, pass it cleanly
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data;
    }
    // Adapt standard responses to contract format
    return {
      success: true,
      message: response.data?.message || 'Operation successful',
      data: response.data?.data !== undefined ? response.data.data : response.data,
    };
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // FastAPI validation error (422) handling
      let errorMessage = 'An error occurred while processing your request.';
      if (status === 422 && Array.isArray(data?.detail)) {
        errorMessage = data.detail
          .map((err) => `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg}`)
          .join(', ');
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (typeof data?.detail === 'string') {
        errorMessage = data.detail;
      } else if (status === 401) {
        errorMessage = 'Session expired or invalid credentials. Please log in again.';
        localStorage.removeItem('medicore_token');
        localStorage.removeItem('medicore_user');
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = data?.message || 'The requested resource was not found.';
      } else if (status >= 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }

      return Promise.reject({
        success: false,
        status,
        message: errorMessage,
        data: null,
      });
    } else if (error.request) {
      // Network error or backend down
      return Promise.reject({
        success: false,
        status: 0,
        message: 'Unable to reach the server. Please verify the backend is running.',
        data: null,
      });
    }

    return Promise.reject({
      success: false,
      status: -1,
      message: error.message || 'Unknown network error occurred.',
      data: null,
    });
  }
);

export default api;

