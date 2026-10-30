import api from './api';

export const getVendorReviews = async (vendorId) =>
  (await api.get(`/vendor-reviews/vendor/${vendorId}`)).data;
export const createVendorReview = async (review) =>
  (await api.post('/vendor-reviews', review)).data;
export const uploadVendorReviewMedia = async (reviewId, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('media', file));
  return (await api.post(`/vendor-reviews/${reviewId}/media`, formData)).data;
};
export const deleteVendorReviewMedia = async ({ reviewId, mediaIndex }) =>
  (await api.delete(`/vendor-reviews/${reviewId}/media/${mediaIndex}`)).data;
export const getPendingVendorReviews = async () =>
  (await api.get('/vendor-reviews/admin/pending')).data;
export const moderateVendorReview = async ({ reviewId, status }) =>
  (await api.patch(`/vendor-reviews/admin/${reviewId}`, { status })).data;
