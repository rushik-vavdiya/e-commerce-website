import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as websiteReviewService from '../services/websiteReviewService';

const request = (name, call) =>
  createAsyncThunk(name, async (args, { rejectWithValue }) => {
    try {
      return await call(args);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

export const fetchWebsiteReviews = request('websiteReviews/fetch', websiteReviewService.getWebsiteReviews);
export const addWebsiteReview = request('websiteReviews/create', websiteReviewService.createWebsiteReview);
export const removeWebsiteReview = request('websiteReviews/delete', websiteReviewService.deleteWebsiteReview);
export const fetchPendingWebsiteReviews = request(
  'websiteReviews/fetchPending',
  websiteReviewService.getPendingWebsiteReviews,
);
export const moderateWebsiteReview = request(
  'websiteReviews/moderate',
  websiteReviewService.moderateWebsiteReview,
);

const requests = [
  fetchWebsiteReviews,
  addWebsiteReview,
  removeWebsiteReview,
  fetchPendingWebsiteReviews,
  moderateWebsiteReview,
];

const websiteReviewSlice = createSlice({
  name: 'websiteReviews',
  initialState: { items: [], pendingItems: [], loading: false, error: null },
  reducers: { clearWebsiteReviewError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) =>
      builder
        .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }),
    );

    builder
      .addCase(fetchWebsiteReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(addWebsiteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(removeWebsiteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(fetchPendingWebsiteReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingItems = action.payload.data;
      })
      .addCase(moderateWebsiteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingItems = state.pendingItems.filter((item) => item._id !== action.payload.data._id);
      });
  },
});

export const { clearWebsiteReviewError } = websiteReviewSlice.actions;
export default websiteReviewSlice.reducer;
