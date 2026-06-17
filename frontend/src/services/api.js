import axios from 'axios';
import { getToken, clearToken } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !error.config?.url?.includes('/auth/login')
    ) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

  if (typeof message === 'string') {
    const msgLower = message.toLowerCase();

    // Check for raw technical keywords/exceptions and translate to clean human equivalents
    if (msgLower.includes('validationerror') || msgLower.includes('validation failed')) {
      return 'Please check the information entered.';
    }
    if (msgLower.includes('e11000') || msgLower.includes('duplicate key') || msgLower.includes('mongoerror')) {
      return 'This record already exists.';
    }
    if (msgLower.includes('casterror') || msgLower.includes('cast to objectid failed')) {
      return 'The requested record could not be found.';
    }
    if (msgLower.includes('unauthorized') || msgLower.includes('jwt') || msgLower.includes('token expired') || msgLower.includes('please log in to continue')) {
      return 'Please log in to continue.';
    }
    if (msgLower.includes('forbidden') || msgLower.includes('not permitted') || msgLower.includes('do not have permission')) {
      return 'You do not have permission to perform this action.';
    }
    if (msgLower.includes('hospital verification failed')) {
      return 'Unable to verify hospital right now. Please try again.';
    }
    if (
      msgLower.includes('internal server error') ||
      msgLower.includes('cannot read properties') ||
      msgLower.includes('database error') ||
      msgLower.includes('mongodb')
    ) {
      return 'Something went wrong. Please try again.';
    }
  }

  return message;
};

export default api;
