import api from './api';

export const getCategories = async (filters = {}) =>
  (await api.get('/categories', { params: filters })).data;
export const getCategory = async (categoryId) => (await api.get(`/categories/${categoryId}`)).data;
export const createCategory = async (category) => (await api.post('/categories', category)).data;
export const updateCategory = async (categoryId, category) =>
  (await api.put(`/categories/${categoryId}`, category)).data;
export const deleteCategory = async (categoryId) => (await api.delete(`/categories/${categoryId}`)).data;
export const setCategoryStatus = async (categoryId, status) =>
  (await api.patch(`/categories/${categoryId}/status`, { status })).data;
// The full set of products that should be listed in the category.
export const setCategoryProducts = async (categoryId, productIds = []) =>
  (await api.put(`/categories/${categoryId}/products`, { productIds })).data;
export const uploadCategoryImages = async (categoryId, { image, bannerImage }) => {
  const formData = new FormData();
  if (image) formData.append('image', image);
  if (bannerImage) formData.append('bannerImage', bannerImage);
  return (await api.put(`/categories/${categoryId}/images`, formData)).data;
};
export const deleteCategoryImage = async (categoryId, imageType) =>
  (await api.delete(`/categories/${categoryId}/images/${imageType}`)).data;
