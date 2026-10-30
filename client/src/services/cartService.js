import api from './api';

export const getCart = async () => (await api.get('/cart')).data;
export const addCartProduct = async (product) => (await api.post('/cart/products', product)).data;
export const updateCartProduct = async (itemId, quantity) =>
  (await api.patch(`/cart/products/${itemId}`, { quantity })).data;
export const removeCartProduct = async (itemId) => (await api.delete(`/cart/products/${itemId}`)).data;
export const clearCart = async () => (await api.delete('/cart')).data;
