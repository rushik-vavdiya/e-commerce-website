import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as userService from '../services/userService';

const getError = (error) => error.response?.data?.message || error.message;

export const fetchMe = createAsyncThunk('user/fetchMe', async (_, { rejectWithValue }) => {
  try { return await userService.getMe(); } catch (error) { return rejectWithValue(getError(error)); }
});
// PATCH /users/me — profile fields only (first name, last name, phone, gender,
// birth date). The updated user is stored so the profile screens show it.
export const updateMyProfile = createAsyncThunk('user/updateMe', async (profile, { rejectWithValue }) => {
  try { return await userService.updateMe(profile); } catch (error) { return rejectWithValue(getError(error)); }
});
export const fetchProfilePicture = createAsyncThunk('user/fetchProfilePicture', async (_, { rejectWithValue }) => {
  try { return await userService.getProfilePicture(); } catch (error) { return rejectWithValue(getError(error)); }
});
export const uploadProfilePicture = createAsyncThunk('user/uploadProfilePicture', async (image, { rejectWithValue }) => {
  try { return await userService.updateProfilePicture(image); } catch (error) { return rejectWithValue(getError(error)); }
});
export const removeProfilePicture = createAsyncThunk('user/removeProfilePicture', async (_, { rejectWithValue }) => {
  try { return await userService.deleteProfilePicture(); } catch (error) { return rejectWithValue(getError(error)); }
});
export const removeAccount = createAsyncThunk('user/removeAccount', async (_, { rejectWithValue }) => {
  try { return await userService.deleteAccount(); } catch (error) { return rejectWithValue(getError(error)); }
});

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload.data; })
      .addCase(fetchMe.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateMyProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateMyProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload.data; })
      .addCase(updateMyProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.profile) state.profile.profilePicture = action.payload.data.profilePicture;
      })
      .addCase(fetchProfilePicture.fulfilled, (state, action) => {
        if (state.profile) state.profile.profilePicture = action.payload.data.profilePicture;
      })
      .addCase(removeProfilePicture.fulfilled, (state, action) => {
        if (state.profile) state.profile.profilePicture = action.payload.data.profilePicture;
      })
      .addCase(removeAccount.fulfilled, (state) => { state.profile = null; });
  },
});

export default userSlice.reducer;
