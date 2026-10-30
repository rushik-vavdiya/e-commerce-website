import api from './api';

export const createPayment = async (payment) => (await api.post('/payments', payment)).data;
export const verifyPayment = async (payment) => (await api.post('/payments/verify', payment)).data;
// Admin only: the payment record (provider ids, refund state) for one order.
export const getOrderPayment = async (orderId) =>
  (await api.get(`/payments/order/${orderId}`)).data;
export const refundPayment = async ({ paymentId, amount }) =>
  (await api.post(`/payments/${paymentId}/refund`, { amount })).data;
