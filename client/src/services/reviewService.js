import api from './api';

export const getProductReviews = async (productId) => (await api.get(`/reviews/product/${productId}`)).data;
export const createReview = async (review) => (await api.post('/reviews', review)).data;
export const updateReview = async ({ reviewId, review }) =>
  (await api.put(`/reviews/${reviewId}`, review)).data;
export const deleteReview = async (reviewId) => (await api.delete(`/reviews/${reviewId}`)).data;
export const uploadReviewMedia = async (reviewId, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('media', file));
  return (await api.post(`/reviews/${reviewId}/media`, formData)).data;
};
export const deleteReviewMedia = async ({ reviewId, mediaIndex }) =>
  (await api.delete(`/reviews/${reviewId}/media/${mediaIndex}`)).data;
export const getPendingReviews = async () => (await api.get('/reviews/admin/pending')).data;
export const moderateReview = async ({ reviewId, status }) =>
  (await api.patch(`/reviews/admin/${reviewId}`, { status })).data;
