import api from './api';

export const validateCoupon = async (code) => (await api.post('/coupons/validate', { code })).data;
export const getCoupons = async () => (await api.get('/coupons')).data;
export const createCoupon = async (coupon) => (await api.post('/coupons', coupon)).data;
export const updateCoupon = async ({ couponId, coupon }) =>
  (await api.put(`/coupons/${couponId}`, coupon)).data;
export const deleteCoupon = async (couponId) => (await api.delete(`/coupons/${couponId}`)).data;
