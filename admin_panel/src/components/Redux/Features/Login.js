import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const AuthUrl = "http://194.163.173.179:3300/api/auth/login";
const RefreshUrl = "http://194.163.173.179:3300/api/auth/refresh";

// 🔹 Admin login
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ username, password }) => {
    const res = await axios.post(
      AuthUrl,
      { phone: username, password },
      { headers: { "Content-Type": "application/json" } }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user || res.data));
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem("tokenExpiration", expirationTime.toString());

    return res.data;
  }
);

// 🔹 Admin logout
export const logoutAdmin = createAsyncThunk("auth/logoutAdmin", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      await axios.post(
        "http://194.163.173.179:3300/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("refreshToken");
  return null;
});

// 🔹 Refresh token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Refresh token mövcud deyil");

    const res = await axios.post(
      RefreshUrl,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    const expirationTime = new Date().getTime() + res.data.expiresIn * 1000;
    localStorage.setItem("tokenExpiration", expirationTime.toString());

    return res.data;
  }
);

// 🔹 Token müddətini yoxlayan funksiya
export const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  const expirationTime = localStorage.getItem("tokenExpiration");
  if (!expirationTime) return false;

  const currentTime = new Date().getTime();
  return currentTime > parseInt(expirationTime);
};

// 🔹 İlkin state
const getInitialAuthState = () => {
  let token = localStorage.getItem("token");
  let user = localStorage.getItem("user");

  if (token && checkTokenExpiration()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiration");
    token = null;
    user = null;
  }

  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch {
    parsedUser = null;
  }

  return {
    token,
    user: parsedUser,
    isAuthenticated: Boolean(token && parsedUser && !checkTokenExpiration()),
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...getInitialAuthState(),
    loading: false,
    error: null,
  },
  reducers: {
    clearExpiredToken: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = "Sessiya müddəti bitdi. Yenidən daxil olun.";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // Refresh token varsa localStorage-a əlavə et
        if (action.payload.refreshToken)
          localStorage.setItem("refreshToken", action.payload.refreshToken);

        // 🔹 Konsola istifadəçi məlumatlarını çıxart
        console.log("Login oldu! İstifadəçi məlumatları:", state.user);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Xəta baş verdi";
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error =
          action.error.message || "Token yenilənməsi alınmadı. Yenidən daxil olun.";
      });
  },
});

export const { clearExpiredToken } = authSlice.actions;
export default authSlice.reducer;
