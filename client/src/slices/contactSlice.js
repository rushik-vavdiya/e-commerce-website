import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as contactService from '../services/contactService';

const request = (name, call) =>
  createAsyncThunk(name, async (args, { rejectWithValue }) => {
    try {
      return await call(args);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

export const sendContactMessage = request('contact/send', contactService.sendContactMessage);
export const fetchContactMessages = request('contact/fetch', contactService.getContactMessages);

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    items: [],
    pagination: null,
    sending: false,
    sent: false,
    message: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearContactStatus: (state) => {
      state.sending = false;
      state.sent = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendContactMessage.pending, (state) => {
        state.sending = true;
        state.sent = false;
        state.message = null;
        state.error = null;
      })
      .addCase(sendContactMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.sent = true;
        state.message = action.payload.message;
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload || 'Could not send your message. Please try again.';
      })
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContactStatus } = contactSlice.actions;
export default contactSlice.reducer;
