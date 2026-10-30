import api from './api';

export const applyForVendor = async (application) => (await api.post('/vendors', application)).data;
export const getMyVendor = async () => (await api.get('/vendors/me')).data;
export const updateMyVendor = async (vendor) => (await api.patch('/vendors/me', vendor)).data;
export const getVendors = async () => (await api.get('/vendors')).data;
// Public directory: approved, active stores only. No token needed.
export const getPublicVendors = async () => (await api.get('/vendors/public')).data;
export const reviewVendor = async ({ vendorId, approvalStatus, rejectionReason }) =>
  (await api.patch(`/vendors/${vendorId}/review`, { approvalStatus, rejectionReason })).data;
