import api from './api';

export const updateProfile = (data) => api.put('/profile', data);

export const sendPasswordOtp = () => api.post('/profile/send-password-otp');

export const verifyPasswordOtp = (otp) => api.post('/profile/verify-password-otp', { otp });

export const changePassword = (newPassword) =>
  api.patch('/profile/change-password', { newPassword });

export const deactivateAccount = () => api.post('/profile/deactivate');

export const deleteAccount = () => api.delete('/profile');
