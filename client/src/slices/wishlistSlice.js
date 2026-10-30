import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as wishlistService from '../services/wishlistService';

const getError = (error) => error.response?.data?.message || error.message;
const createRequest = (name, serviceCall) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await serviceCall(args); } catch (error) { return rejectWithValue(getError(error)); }
});

export const fetchWishlist = createRequest('wishlist/fetch', wishlistService.getWishlist);
export const addToWishlist = createRequest('wishlist/add', wishlistService.addWishlistProduct);
export const removeFromWishlist = createRequest('wishlist/remove', wishlistService.removeWishlistProduct);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { wishlist: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.wishlist = action.payload.data; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToWishlist.fulfilled, (state, action) => { state.wishlist = action.payload.data; })
      .addCase(removeFromWishlist.fulfilled, (state, action) => { state.wishlist = action.payload.data; });
  },
});

export default wishlistSlice.reducer;
