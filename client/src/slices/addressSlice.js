import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as addressService from '../services/addressService';

const getError = (error) => error.response?.data?.message || error.message;
const createRequest = (name, serviceCall) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await serviceCall(args); } catch (error) { return rejectWithValue(getError(error)); }
});

export const fetchAddresses = createRequest('addresses/fetch', addressService.getAddresses);
export const fetchAddress = createRequest('addresses/fetchOne', addressService.getAddress);
export const addAddress = createRequest('addresses/create', addressService.createAddress);
export const editAddress = createRequest('addresses/update', ({ addressId, address }) => addressService.updateAddress(addressId, address));
export const removeAddress = createRequest('addresses/delete', addressService.deleteAddress);

const addressSlice = createSlice({
  name: 'addresses',
  initialState: { items: [], selected: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAddresses.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; })
      .addCase(fetchAddresses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAddress.fulfilled, (state, action) => { state.selected = action.payload.data; })
      .addCase(addAddress.fulfilled, (state, action) => { state.items.unshift(action.payload.data); })
      .addCase(editAddress.fulfilled, (state, action) => { state.items = state.items.map((item) => item._id === action.payload.data._id ? action.payload.data : item); })
      .addCase(removeAddress.fulfilled, (state, action) => { state.items = state.items.filter((item) => item._id !== action.meta.arg); });
  },
});

export default addressSlice.reducer;
