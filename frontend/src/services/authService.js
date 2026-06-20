import api from './api';

export const register = (data) => api.post('/auth/register', data);

export const login = (data) => api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (resetToken, password) =>
  api.put(`/auth/reset-password/${resetToken}`, { password });
