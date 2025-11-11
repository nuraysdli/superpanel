// Redux/Features/RefreshSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// 🔹 refresh token istəyi göndər
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return rejectWithValue("No refresh token found");

    try {
      const res = await api.post("/api/auth/refresh", { refreshToken });
      return res.data; // { token, refreshToken }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const refreshSlice = createSlice({
  name: "refresh",
  initialState: { loading: false, error: null, success: false },
  reducers: {
    clearRefreshState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        localStorage.setItem("token", action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRefreshState } = refreshSlice.actions;
export default refreshSlice.reducer;
