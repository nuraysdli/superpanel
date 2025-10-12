import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// ============================
// 🔹 Async Thunks
// ============================

// 🔹 Rolları gətir
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/roles");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Yeni rol əlavə et
export const addRole = createAsyncThunk(
  "roles/addRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/roles", roleData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Rolu yenilə (PUT)
export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const res = await api.put("/api/roles", roleData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Rolu sil
export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============================
// 🔹 Slice
// ============================
const roleSlice = createSlice({
  name: "roles",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // addRole
      .addCase(addRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default roleSlice.reducer;
