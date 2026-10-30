import api from './api';

export const getWebsiteReviews = async () => (await api.get('/website-reviews')).data;
export const createWebsiteReview = async (review) => (await api.post('/website-reviews', review)).data;
export const deleteWebsiteReview = async (reviewId) =>
  (await api.delete(`/website-reviews/${reviewId}`)).data;
export const getPendingWebsiteReviews = async () =>
  (await api.get('/website-reviews/admin/pending')).data;
export const moderateWebsiteReview = async ({ reviewId, status }) =>
  (await api.patch(`/website-reviews/admin/${reviewId}`, { status })).data;
