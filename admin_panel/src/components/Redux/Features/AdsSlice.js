import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api";

// ============================
// 🔹 Async Thunks
// ============================

// 🔹 Reklamları gətir
export const fetchAds = createAsyncThunk(
  "ads/fetchAds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/ads", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Yeni reklam əlavə et (user məlumatı ilə)
export const addAd = createAsyncThunk(
  "ads/addAd",
  async (adData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth?.user || JSON.parse(localStorage.getItem("user")) || {};
      const body = { ...adData, userId: currentUser.id, userName: currentUser.name };

      const res = await api.post("/api/ads", body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("AddAd response:", res.data);
      return res.data;
    } catch (error) {
      console.log("AddAd error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Reklama şəkil yüklə
export const uploadAdImage = createAsyncThunk(
  "ads/uploadAdImage",
  async ({ id, file, locale = "AZ" }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(`/api/ads/${id}/upload-image?locale=${locale}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("UploadAdImage response:", res.data);
      return { id, uuidName: res.data.uuidName, locale };
    } catch (error) {
      console.log("UploadAdImage error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Reklamı sil
export const deleteAd = createAsyncThunk(
  "ads/deleteAd",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("DeleteAd success:", id);
      return id;
    } catch (error) {
      console.log("DeleteAd error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Reklamı yenilə (PUT)
export const updateAd = createAsyncThunk(
  "ads/updateAd",
  async ({ id, updatedFields }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const ad = state.ads.list.find(a => a.id === id);
      if (!ad) throw new Error("Reklam tapılmadı");

      const body = { ...ad, ...updatedFields };
      console.log("UpdateAd body:", body);
      console.log("UpdateAd headers token:", localStorage.getItem("token"));

      const res = await api.put(`/api/ads/${id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("UpdateAd response:", res.data);
      return res.data;
    } catch (error) {
      console.log("UpdateAd error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Faylı endir
export const downloadFile = createAsyncThunk(
  "ads/downloadFile",
  async (filename, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/files/download/${filename}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log("DownloadFile success:", filename);
      return filename;
    } catch (error) {
      console.log("DownloadFile error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============================
// 🔹 Slice
// ============================
const adsSlice = createSlice({
  name: "ads",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAds
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // addAd
      .addCase(addAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAd.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // uploadAdImage
      .addCase(uploadAdImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAdImage.fulfilled, (state, action) => {
        state.loading = false;
        const { id, uuidName } = action.payload;
        const index = state.list.findIndex(ad => ad.id === id);
        if (index !== -1) {
          state.list[index].pictureUrl = uuidName;
        }
      })
      .addCase(uploadAdImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // deleteAd
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.list = state.list.filter(ad => ad.id !== action.payload);
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // updateAd
      .addCase(updateAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(ad => ad.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // downloadFile
      .addCase(downloadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default adsSlice.reducer;
