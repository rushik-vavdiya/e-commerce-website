import api from './api';

export const getWishlist = async () => (await api.get('/wishlist')).data;
export const addWishlistProduct = async (productId) =>
  (await api.post('/wishlist/products', { productId })).data;
export const removeWishlistProduct = async (productId) =>
  (await api.delete(`/wishlist/products/${productId}`)).data;
