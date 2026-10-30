import api from './api';

// `filters` is only sent by the admin screen (order number, statuses).
export const getOrders = async (filters = {}) =>
  (await api.get('/orders', { params: filters })).data;
export const getOrder = async (orderId) => (await api.get(`/orders/${orderId}`)).data;
export const createOrder = async (order) =>
  (await api.post('/orders', order, { headers: { 'Idempotency-Key': order.idempotencyKey } })).data;
export const cancelOrder = async (orderId) => (await api.post(`/orders/${orderId}/cancel`)).data;
export const updateOrderStatus = async ({ orderId, orderStatus }) =>
  (await api.patch(`/orders/${orderId}/status`, { orderStatus })).data;
export const updateOrderTracking = async ({ orderId, trackingNumber, courierName }) =>
  (await api.patch(`/orders/${orderId}/tracking`, { trackingNumber, courierName })).data;
