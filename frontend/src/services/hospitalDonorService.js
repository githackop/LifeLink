import api from './api';

export const getHospitalDonors = () =>
  api.get('/hospital-donors');

export const addManualHospitalDonor = (data) =>
  api.post('/hospital-donors/manual', data);

export const updateHospitalDonor = (id, data) =>
  api.put(`/hospital-donors/${id}`, data);

export const deleteHospitalDonor = (id) =>
  api.delete(`/hospital-donors/${id}`);