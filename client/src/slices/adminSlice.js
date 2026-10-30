import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as adminService from '../services/adminService';

const request = (name, call) => createAsyncThunk(name, async (args, { rejectWithValue }) => {
  try { return await call(args); } catch (error) { return rejectWithValue(error.response?.data?.message || error.message); }
});
export const fetchAdminDashboard = request('admin/fetchDashboard', adminService.getDashboard);
export const fetchAdminUsers = request('admin/fetchUsers', adminService.getUsers);
export const changeUserStatus = request('admin/userStatus', adminService.updateUserStatus);
const requests = [fetchAdminDashboard, fetchAdminUsers, changeUserStatus];

const adminSlice = createSlice({
  name: 'admin', initialState: { dashboard: null, users: [], loading: false, error: null },
  reducers: { clearAdminError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    requests.forEach((action) => builder
      .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(action.rejected, (state, result) => { state.loading = false; state.error = result.payload; }));
    builder
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload.data; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload.data; })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) => user._id === action.payload.data._id ? action.payload.data : user);
      });
  },
});
export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
