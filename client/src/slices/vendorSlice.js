import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as vendorService from '../services/vendorService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const applyForVendor = request('vendor/apply', vendorService.applyForVendor);
export const fetchMyVendor = request('vendor/fetchMe', vendorService.getMyVendor);
export const editMyVendor = request('vendor/updateMe', vendorService.updateMyVendor);
export const fetchVendors = request('vendor/fetchAll', vendorService.getVendors);
export const reviewVendorApplication = request('vendor/review', vendorService.reviewVendor);
// The public store directory the storefront search suggests from. It is kept
// apart from `items` (the admin list) and never touches the shared `loading`
// flag, so opening the search box cannot make a dashboard look busy.
export const fetchPublicVendors = request('vendor/fetchPublic', vendorService.getPublicVendors);
const requests = [applyForVendor, fetchMyVendor, editMyVendor, fetchVendors, reviewVendorApplication];

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    current: null,
    items: [],
    publicItems: [],
    // True once the directory has been asked for, so suggestions request it
    // once per session instead of on every keystroke.
    publicLoaded: false,
    loading: false,
    error: null,
  },
  reducers: { clearVendorError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    [applyForVendor, fetchMyVendor, editMyVendor].forEach((action) => builder
      .addCase(action.fulfilled, (state, result) => { state.loading = false; state.current = result.payload.data; }));
    builder
      .addCase(fetchPublicVendors.fulfilled, (state, result) => {
        state.publicLoaded = true;
        state.publicItems = result.payload.data ?? [];
      })
      .addCase(fetchPublicVendors.rejected, (state) => {
        // Mark it as asked so a failing API is not retried on every keystroke.
        state.publicLoaded = true;
      })
      .addCase(fetchVendors.fulfilled, (state, result) => { state.loading = false; state.items = result.payload.data; })
      .addCase(reviewVendorApplication.fulfilled, (state, result) => {
        state.loading = false;
        state.items = state.items.map((item) => item._id === result.payload.data._id ? result.payload.data : item);
      });
  },
});
export const { clearVendorError } = vendorSlice.actions;
export default vendorSlice.reducer;
