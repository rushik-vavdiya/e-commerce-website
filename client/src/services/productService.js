import api from './api';

export const getProducts = async (filters = {}) =>
  (await api.get('/products', { params: filters })).data;
export const getProduct = async (productId) => (await api.get(`/products/${productId}`)).data;
// The filter rail's options: the sizes and colours the catalogue carries plus
// its price band.
export const getProductFilterOptions = async () =>
  (await api.get('/products/facets')).data;
export const createProduct = async (product) => (await api.post('/products', product)).data;
export const updateProduct = async (productId, product) =>
  (await api.put(`/products/${productId}`, product)).data;
export const deleteProduct = async (productId) => (await api.delete(`/products/${productId}`)).data;
export const setProductStatus = async (productId, status) =>
  (await api.patch(`/products/${productId}/status`, { status })).data;

export const uploadProductImages = async (productId, { mainImage, galleryImages = [] }) => {
  const formData = new FormData();
  if (mainImage) formData.append('mainImage', mainImage);
  galleryImages.forEach((image) => formData.append('galleryImages', image));
  return (await api.put(`/products/${productId}/images`, formData)).data;
};

export const deleteProductMainImage = async (productId) =>
  (await api.delete(`/products/${productId}/images/main`)).data;
export const deleteProductGalleryImage = async (productId, imageIndex) =>
  (await api.delete(`/products/${productId}/images/gallery/${imageIndex}`)).data;

export const uploadVariantImages = async (productId, variantId, { mainImage, galleryImages = [] }) => {
  const formData = new FormData();
  if (mainImage) formData.append('mainImage', mainImage);
  galleryImages.forEach((image) => formData.append('galleryImages', image));
  return (await api.put(`/products/${productId}/variants/${variantId}/images`, formData)).data;
};

export const deleteVariantMainImage = async (productId, variantId) =>
  (await api.delete(`/products/${productId}/variants/${variantId}/images/main`)).data;
export const deleteVariantGalleryImage = async (productId, variantId, imageIndex) =>
  (await api.delete(`/products/${productId}/variants/${variantId}/images/gallery/${imageIndex}`)).data;
