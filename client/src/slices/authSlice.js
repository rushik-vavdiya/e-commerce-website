import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authService from '../services/authService';

const savedUser = localStorage.getItem('user');

// The backend returns { success: false, message } and, for validation
// failures, also { errors: [{ field, message }] }.
const getAuthError = (error) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((issue) => issue.message).join('. ');
  }

  return data?.message || error.message;
};

export const loginUser = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.login(userData);
    if (response.token) localStorage.setItem('token', response.token);
    if (response.data) localStorage.setItem('user', JSON.stringify(response.data));
    return response;
  } catch (error) {
    return rejectWithValue(getAuthError(error));
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    return await authService.register(userData);
  } catch (error) {
    return rejectWithValue(getAuthError(error));
  }
});

// POST /auth/verify-email  payload: { token } — from the emailed link
export const verifyEmailToken = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    return await authService.verifyEmail(token);
  } catch (error) {
    return rejectWithValue(getAuthError(error));
  }
});

// POST /auth/resend-verification  payload: email
export const resendVerificationCode = createAsyncThunk('auth/resendVerification', async (email, { rejectWithValue }) => {
  try {
    return await authService.resendVerification(email);
  } catch (error) {
    return rejectWithValue(getAuthError(error));
  }
});

// POST /auth/forgot-password  payload: email
export const requestPasswordReset = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    return await authService.forgotPassword(email);
  } catch (error) {
    return rejectWithValue(getAuthError(error));
  }
});

// PATCH /auth/change-password  payload: { oldPassword, newPassword }
// The backend bumps the account token version, so the session is invalidated and
// the caller signs the user out.
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      return await authService.changePassword({ oldPassword, newPassword });
    } catch (error) {
      return rejectWithValue(getAuthError(error));
    }
  },
);

// POST /auth/reset-password  payload: { token, newPassword }
export const resetPasswordWithToken = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      return await authService.resetPassword({ token, newPassword });
    } catch (error) {
      return rejectWithValue(getAuthError(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthMessage: (state) => {
      state.message = null;
    },
    // Keeps the signed-in user in the header and dashboards in step after a
    // profile update (POST/PATCH responses return the new values).
    updateSessionUser: (state, action) => {
      state.user = { ...(state.user ?? {}), ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.message = action.payload.message ?? null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyEmailToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmailToken.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(verifyEmailToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendVerificationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resendVerificationCode.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(resendVerificationCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message ?? null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Logs out locally no matter what, and asks the backend to invalidate the token.
export const logoutUser = () => async (dispatch) => {
  try {
    if (localStorage.getItem('token')) {
      await authService.logout();
    }
  } catch {
    // The local session is cleared below even if the server call fails.
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(authSlice.actions.logout());
  }
};

export const { clearAuthError, clearAuthMessage, updateSessionUser } = authSlice.actions;
export default authSlice.reducer;
