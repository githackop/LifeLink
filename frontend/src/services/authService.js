import api from './api';

export const register = (data) => api.post('/auth/register', data);

export const login = (data) => api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (resetToken, password) =>
  api.put(`/auth/reset-password/${resetToken}`, { password });

export const sendVerificationOtp = (email) => api.post('/auth/send-verification-otp', { email });

export const verifyEmailOtp = (email, otp) => api.post('/auth/verify-email-otp', { email, otp });

export const resendVerificationOtp = (email) => api.post('/auth/resend-verification-otp', { email });
