import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as reviewService from '../services/reviewService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchProductReviews = request('reviews/fetchProduct', reviewService.getProductReviews);
export const addReview = request('reviews/create', reviewService.createReview);
export const editReview = request('reviews/update', reviewService.updateReview);
export const removeReview = request('reviews/delete', reviewService.deleteReview);
export const addReviewMedia = request('reviews/addMedia', ({ reviewId, files }) =>
  reviewService.uploadReviewMedia(reviewId, files));
export const removeReviewMedia = request('reviews/removeMedia', reviewService.deleteReviewMedia);
export const fetchPendingReviews = request('reviews/fetchPending', reviewService.getPendingReviews);
export const reviewPendingItem = request('reviews/moderate', reviewService.moderateReview);
const requests = [fetchProductReviews, addReview, editReview, removeReview, addReviewMedia, removeReviewMedia, fetchPendingReviews, reviewPendingItem];

const reviewSlice = createSlice({
  // `itemsProductId` records which product the rows in `items` belong to, so a
  // page never shows one product's reviews under another product.
  name: 'reviews', initialState: { items: [], itemsProductId: null, pendingItems: [], loading: false, error: null },
  reducers: { clearReviewError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.filter((action) => action !== fetchProductReviews).forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    builder
      .addCase(fetchProductReviews.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.items = [];
        state.itemsProductId = action.meta.arg;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; })
      .addCase(fetchProductReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addReview.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload.data); })
      .addCase(addReviewMedia.fulfilled, (state, action) => { state.loading = false; state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeReviewMedia.fulfilled, (state, action) => { state.loading = false; state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(editReview.fulfilled, (state, action) => { state.loading = false; state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeReview.fulfilled, (state, action) => { state.loading = false; state.items = state.items.filter((item) => item._id !== action.meta.arg); })
      .addCase(fetchPendingReviews.fulfilled, (state, action) => { state.loading = false; state.pendingItems = action.payload.data; })
      .addCase(reviewPendingItem.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingItems = state.pendingItems.filter((item) => item._id !== action.payload.data._id);
      });
  },
});
export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
