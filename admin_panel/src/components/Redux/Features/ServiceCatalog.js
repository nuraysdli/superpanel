import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

export const fetchServiceCatalogPages = createAsyncThunk("serviceCatalog/fetchServiceCatalogPages", async () => {
  const res = await api.get("/api/service-catalog-professional-pages");
  return res.data;
});

export const fetchBusinessPages = createAsyncThunk("serviceCatalog/fetchBusinessPages", async () => {
  const res = await api.get("/api/businesses/pages");
  return res.data;
});

const serviceCatalogSlice = createSlice({
  name: "serviceCatalog",
  initialState: { catalogPages: [], businessPages: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceCatalogPages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchServiceCatalogPages.fulfilled, (state, action) => { state.loading = false; state.catalogPages = action.payload; })
      .addCase(fetchServiceCatalogPages.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })

      .addCase(fetchBusinessPages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBusinessPages.fulfilled, (state, action) => { state.loading = false; state.businessPages = action.payload; })
      .addCase(fetchBusinessPages.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  },
});

export default serviceCatalogSlice.reducer;
