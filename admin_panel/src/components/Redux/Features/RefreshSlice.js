import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔹 Refresh token API URL
const RefreshUrl = "http://194.163.173.179:3300/api/auth/refresh";

// 🔹 Async thunk: token refresh
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("Refresh token mövcud deyil");

      const res = await axios.post(
        RefreshUrl,
        { refreshToken }, // API schema-ya uyğun
        { headers: { "Content-Type": "application/json" } }
      );

      // Tokenləri localStorage-a yaz
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      const expirationTime = new Date().getTime() + res.data.expiresIn * 1000;
      localStorage.setItem("tokenExpiration", expirationTime.toString());

      return res.data;
    } catch (err) {
      // Error yaranarsa rejectWithValue ilə göndər
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const refreshSlice = createSlice({
  name: "refresh",
  initialState: {
    loading: false,
    error: null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    isAuthenticated: !!localStorage.getItem("token"),
  },
  reducers: {
    clearRefreshState: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiration");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Token yenilənmədi";
      });
  },
});

export const { clearRefreshState } = refreshSlice.actions;
export default refreshSlice.reducer;
