import api from './api';

export const getAdminStats = () => api.get('/admin/stats');

export const getAdminUsers = (params) => api.get('/admin/users', { params });

export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);

export const toggleUserBlock = (id, blocked) =>
  api.patch(`/admin/users/${id}/block`, typeof blocked === 'boolean' ? { blocked } : {});

export const getAdminDonors = (params) => api.get('/admin/donors', { params });

export const deleteAdminDonor = (id) => api.delete(`/admin/donors/${id}`);

export const getAdminHospitals = () => api.get('/admin/hospitals');

export const toggleHospitalVerify = (id, verified) =>
  api.patch(`/admin/hospitals/${id}/verify`, typeof verified === 'boolean' ? { verified } : {});

export const toggleHospitalBlock = (id, blocked) =>
  api.patch(`/admin/hospitals/${id}/block`, typeof blocked === 'boolean' ? { blocked } : {});

export const getAdminUserDetails = (id) => api.get(`/admin/users/${id}`);
