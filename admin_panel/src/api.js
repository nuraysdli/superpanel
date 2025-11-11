// api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// =============================
// 🔹 REQUEST — hər sorğuya token əlavə et
// =============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =============================
// 🔹 RESPONSE — refresh token sistemi
// =============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // 🔹 Dinamik import → loop problemi yoxdur
        const { default: store } = await import("./components/Redux/store");
        const { refreshToken, clearRefreshState } = await import(
          "./components/Redux/Features/RefreshSlice"
        );

        // 🔹 refreshToken Redux thunk çağırılır
        const result = await store.dispatch(refreshToken()).unwrap();

        const newToken = result.token;
        localStorage.setItem("token", newToken);

        processQueue(null, newToken);

        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Refresh də uğursuz oldu → çıxış et
        const { default: store } = await import("./components/Redux/store");
        const { clearRefreshState } = await import(
          "./components/Redux/Features/RefreshSlice"
        );
        store.dispatch(clearRefreshState());
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
