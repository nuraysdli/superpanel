import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// ============================
// 🔹 PROFESSIONAL PAGES
// ============================

// 🔸 Bütün professional səhifələri gətir (paginated)
export const fetchProfessionalPages = createAsyncThunk(
  "serviceCatalog/fetchProfessionalPages",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/api/service-catalog-professional-pages?page=${page}&size=${size}`
      );
      return res.data; // { content: [...], page: {...} }
    } catch (err) {
      return rejectWithValue("Professional səhifələr yüklənmədi");
    }
  }
);

// 🔸 Təkər servisləri (paginated)
export const fetchWheelServices = createAsyncThunk(
  "serviceCatalog/fetchWheelServices",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/api/service-catalog-professional-pages/wheel?page=${page}&size=${size}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue("Təkər servisləri yüklənmədi");
    }
  }
);

// 🔸 Avto yuma servisləri (paginated)
export const fetchAutoWashServices = createAsyncThunk(
  "serviceCatalog/fetchAutoWashServices",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/api/service-catalog-professional-pages/auto-wash?page=${page}&size=${size}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue("Avto yuma servisləri yüklənmədi");
    }
  }
);

// ============================
// 🔸 Slice
// ============================

const wheelServicesSlice = createSlice({
  name: "wheelServices",
  initialState: {
    professionalPages: { content: [], page: {} },
    wheelServices: { content: [], page: {} },
    autoWashServices: { content: [], page: {} },
    loading: false,
    error: null,
  },
  reducers: {
    clearCatalogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // 🔸 PROFESSIONAL
      .addCase(fetchProfessionalPages.pending, setPending)
      .addCase(fetchProfessionalPages.fulfilled, (state, action) => {
        state.loading = false;
        state.professionalPages = action.payload;
      })
      .addCase(fetchProfessionalPages.rejected, setRejected)

      // 🔸 WHEEL
      .addCase(fetchWheelServices.pending, setPending)
      .addCase(fetchWheelServices.fulfilled, (state, action) => {
        state.loading = false;
        state.wheelServices = action.payload;
      })
      .addCase(fetchWheelServices.rejected, setRejected)

      // 🔸 AUTO-WASH
      .addCase(fetchAutoWashServices.pending, setPending)
      .addCase(fetchAutoWashServices.fulfilled, (state, action) => {
        state.loading = false;
        state.autoWashServices = action.payload;
      })
      .addCase(fetchAutoWashServices.rejected, setRejected);
  },
});

export const { clearCatalogError } = wheelServicesSlice.actions;
export default wheelServicesSlice.reducer;
