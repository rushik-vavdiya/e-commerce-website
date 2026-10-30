import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as couponService from '../services/couponService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const checkCoupon = request('coupons/validate', couponService.validateCoupon);
export const fetchCoupons = request('coupons/fetch', couponService.getCoupons);
export const addCoupon = request('coupons/create', couponService.createCoupon);
export const editCoupon = request('coupons/update', couponService.updateCoupon);
export const removeCoupon = request('coupons/delete', couponService.deleteCoupon);
const requests = [checkCoupon, fetchCoupons, addCoupon, editCoupon, removeCoupon];

const couponSlice = createSlice({
  name: 'coupons', initialState: { items: [], applied: null, loading: false, error: null },
  reducers: { clearCouponError: (state) => { state.error = null; }, clearAppliedCoupon: (state) => { state.applied = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    builder
      .addCase(checkCoupon.fulfilled, (state, action) => { state.loading = false; state.applied = action.payload.data; })
      .addCase(fetchCoupons.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; })
      .addCase(addCoupon.fulfilled, (state, action) => { state.loading = false; state.items.unshift(action.payload.data); })
      .addCase(editCoupon.fulfilled, (state, action) => { state.loading = false; state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeCoupon.fulfilled, (state, action) => { state.loading = false; state.items = state.items.filter((item) => item._id !== action.meta.arg); });
  },
});
export const { clearCouponError, clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
