import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as vendorReviewService from '../services/vendorReviewService';

const request = (name, call) =>
  createAsyncThunk(name, async (args, { rejectWithValue }) => {
    try {
      return await call(args);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

export const fetchVendorReviews = request('vendorReviews/fetch', vendorReviewService.getVendorReviews);
export const addVendorReview = request('vendorReviews/create', vendorReviewService.createVendorReview);
export const addVendorReviewMedia = request('vendorReviews/addMedia', ({ reviewId, files }) =>
  vendorReviewService.uploadVendorReviewMedia(reviewId, files));
export const removeVendorReviewMedia = request('vendorReviews/removeMedia', vendorReviewService.deleteVendorReviewMedia);
export const fetchPendingVendorReviews = request('vendorReviews/fetchPending', vendorReviewService.getPendingVendorReviews);
export const moderateVendorReview = request('vendorReviews/moderate', vendorReviewService.moderateVendorReview);

const requests = [
  fetchVendorReviews,
  addVendorReview,
  addVendorReviewMedia,
  removeVendorReviewMedia,
  fetchPendingVendorReviews,
  moderateVendorReview,
];

const vendorReviewSlice = createSlice({
  name: 'vendorReviews',
  initialState: { items: [], itemsVendorId: null, pendingItems: [], loading: false, error: null },
  reducers: { clearVendorReviewError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests
      .filter((action) => action !== fetchVendorReviews)
      .forEach((action) =>
        builder
          .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
          .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }),
      );

    builder
      .addCase(fetchVendorReviews.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.items = [];
        state.itemsVendorId = action.meta.arg;
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchVendorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addVendorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(addVendorReviewMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(removeVendorReviewMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })
      .addCase(fetchPendingVendorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingItems = action.payload.data;
      })
      .addCase(moderateVendorReview.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingItems = state.pendingItems.filter((item) => item._id !== action.payload.data._id);
      });
  },
});

export const { clearVendorReviewError } = vendorReviewSlice.actions;
export default vendorReviewSlice.reducer;
