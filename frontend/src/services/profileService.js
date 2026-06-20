import api from './api';

export const updateProfile = (data) => api.put('/profile', data);

export const changePassword = (newPassword) =>
  api.patch('/profile/change-password', { newPassword });

export const deactivateAccount = () => api.post('/profile/deactivate');

export const deleteAccount = () => api.delete('/profile');
