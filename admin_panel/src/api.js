import axios from "axios";

// 🔹 API instance
const api = axios.create({
  baseURL: "http://194.163.173.179:3300",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Setup interceptors funksiyası (store burada import edilmir)
export const setupInterceptors = (store) => {
  // Sorğudan əvvəl token əlavə et
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // Cavab interceptor: token expired olarsa refresh et
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 403 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Redux vasitəsilə refresh token çağır
          const res = await store.dispatch(
            require("./Features/Login").refreshToken()
          ).unwrap();

          // Yeni token ilə orijinal sorğunu təkrar göndər
          originalRequest.headers["Authorization"] = `Bearer ${res.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          store.dispatch(require("./Features/Login").logoutAdmin());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;
