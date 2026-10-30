import api from './api';

export const getDashboard = async () => (await api.get('/admin/dashboard')).data;
export const getUsers = async () => (await api.get('/admin/users')).data;
export const updateUserStatus = async ({ userId, status }) =>
  (await api.patch(`/admin/users/${userId}/status`, { status })).data;
