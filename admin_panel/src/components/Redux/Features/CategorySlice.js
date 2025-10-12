import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// 🔹 Bütün kateqoriyaları gətir
export const fetchCategories = createAsyncThunk("categories/fetchCategories", async () => {
  const res = await api.get("/api/categories");
  return res.data;
});

// 🔹 Lokalizə olunmuş kateqoriyaları gətir
export const fetchLocalizedCategories = createAsyncThunk(
  "categories/fetchLocalizedCategories",
  async (language = "az") => {
    const res = await api.get(`/api/categories/localized?language=${language}`);
    return res.data.productCategoryResponses;
  }
);

// 🔹 Yeni kateqoriya əlavə et
export const addCategory = createAsyncThunk("categories/addCategory", async (categoryData) => {
  const res = await api.post("/api/categories", categoryData);
  return res.data;
});

// 🔹 Kateqoriyanı yenilə
export const updateCategory = createAsyncThunk("categories/updateCategory", async (categoryData) => {
  const res = await api.put("/api/categories", categoryData);
  return res.data;
});

// 🔹 Kateqoriyanı sil
export const deleteCategory = createAsyncThunk("categories/deleteCategory", async (id) => {
  await api.delete(`/api/categories/${id}`);
  return id;
});

// 🔹 ID-yə görə axtarış
export const searchCategoryById = createAsyncThunk(
  "categories/searchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Searching category with ID:", id);
      const res = await api.get(`/api/categories/${id}`);
      console.log("Search API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Search category error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Kateqoriya tapılmadı");
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    localized: [],
    searchResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResult: (state) => {
      state.searchResult = null;
      state.error = null;
    },

    // 🔹 Name ilə axtarış (local filter)
    searchCategoryByName: (state, action) => {
      const searchTerm = action.payload.toLowerCase();
      state.searchResult = state.list.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm)
      );
    },
  },

  extraReducers: (builder) => {
    builder
      // 🔹 fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 🔹 fetchLocalizedCategories
      .addCase(fetchLocalizedCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocalizedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.localized = action.payload;
      })
      .addCase(fetchLocalizedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 🔹 addCategory
      .addCase(addCategory.fulfilled, (state, action) => {
        const newCat = {
          id: action.payload.id,
          name: action.payload.name || action.meta.arg.name, // fallback
        };
        state.list.push(newCat);
        state.localized.push(newCat);
      })

      // 🔹 updateCategory
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCat = {
          id: action.payload.id,
          name: action.payload.name || action.meta.arg.name, // fallback
        };

        const index = state.list.findIndex(cat => cat.id === updatedCat.id);
        if (index >= 0) state.list[index] = updatedCat;

        const locIndex = state.localized.findIndex(cat => cat.id === updatedCat.id);
        if (locIndex >= 0) state.localized[locIndex] = updatedCat;
      })

      // 🔹 deleteCategory
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter(cat => cat.id !== action.payload);
        state.localized = state.localized.filter(cat => cat.id !== action.payload);
      })

      // 🔹 searchCategoryById
      .addCase(searchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResult = action.payload;
        state.error = null;
      })
      .addCase(searchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.searchResult = null;
      });
  },
});

export const { clearSearchResult, searchCategoryByName } = categorySlice.actions;
export default categorySlice.reducer;
