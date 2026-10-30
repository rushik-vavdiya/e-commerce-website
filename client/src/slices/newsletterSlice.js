import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { subscribeToNewsletter as subscribe } from '../services/newsletterService';

export const subscribeToNewsletter = createAsyncThunk(
  'newsletter/subscribe',
  async (email, { rejectWithValue }) => {
    try {
      return await subscribe(email);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState: { subscription: null, loading: false, error: null, message: null },
  reducers: {
    clearNewsletterStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(subscribeToNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(subscribeToNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearNewsletterStatus } = newsletterSlice.actions;
export default newsletterSlice.reducer;
