import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// -----------------------------
// Thunk-lar
// -----------------------------

export const fetchAllBusinesses = createAsyncThunk(
  "businesses/fetchAllBusinesses",
  async () => {
    const res = await api.get("/api/businesses");
    return res.data;
  }
);

export const fetchBusinessById = createAsyncThunk(
  "businesses/fetchBusinessById",
  async (id) => {
    const res = await api.get(`/api/businesses/${id}`);
    return res.data;
  }
);

export const fetchApprovedBusinesses = createAsyncThunk(
  "businesses/fetchApprovedBusinesses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/businesses/approved");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPendingBusinesses = createAsyncThunk(
  "businesses/fetchPendingBusinesses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/businesses/pending");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Search funksiyaları
export const searchApprovedBusinesses = createAsyncThunk(
  "businesses/searchApprovedBusinesses",
  async (companyName, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/businesses/search/approved?companyName=${companyName}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const searchPendingBusinesses = createAsyncThunk(
  "businesses/searchPendingBusinesses",
  async (companyName, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/businesses/search/pending?companyName=${companyName}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const approveBusiness = createAsyncThunk(
  "businesses/approveBusiness",
  async (id) => {
    await api.put(`/api/businesses/${id}/approve`);
    return { id, status: "ACTIVE" }; // status ACTIVE oldu
  }
);


export const rejectBusiness = createAsyncThunk(
  "businesses/rejectBusiness",
  async ({ companyId, reason }) => {
    await api.put(`/api/businesses/reject`, { companyId, reason });
    return { id: companyId, status: "REJECTED", reason };
  }
);

export const blockBusiness = createAsyncThunk(
  "businesses/blockBusiness",
  async ({ companyId, reason }) => {
    await api.put("/api/businesses/block", { companyId, reason });
    return { id: companyId, status: "INACTIVE", reason };
  }
);

export const unblockBusiness = createAsyncThunk(
  "businesses/unblockBusiness",
  async (id) => {
    await api.put(`/api/businesses/${id}/unblock`);
    return { id, status: "ACTIVE" };
  }
);

// TIN əməliyyatları
// TIN qəbul et
export const acceptTIN = createAsyncThunk(
  "businesses/acceptTIN",
  async (id) => {
    await api.post(`/api/businesses/${id}/accept-tin`);
    return { id, status: "ACCEPTED" };
  }
);

// TIN rədd et
export const rejectTIN = createAsyncThunk(
  "businesses/rejectTIN",
  async ({ id, reason }) => {
    if (!reason) throw new Error("Reason required"); // frontend-də yoxlama
    await api.post(`/api/businesses/${id}/reject-tin?reason=${encodeURIComponent(reason)}`);
    return { id, status: "REJECTED", reason };
  }
);


// -----------------------------
// Slice
// -----------------------------
const businessesSlice = createSlice({
  name: "businesses",
  initialState: {
    all: [],
    single: null,
    approved: [],
    pending: [],
    searchApprovedResults: [],
    searchPendingResults: [],
    loading: false,
    searchLoading: false,
    error: null,
    tinAccepting: false,
    tinRejecting: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET-lər
      .addCase(fetchAllBusinesses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllBusinesses.fulfilled, (state, action) => { state.loading = false; state.all = action.payload; })
      .addCase(fetchAllBusinesses.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })

      .addCase(fetchBusinessById.fulfilled, (state, action) => { state.single = action.payload; })
      .addCase(fetchApprovedBusinesses.fulfilled, (state, action) => { state.approved = action.payload; })
      .addCase(fetchPendingBusinesses.fulfilled, (state, action) => { state.pending = action.payload; })

      // Search
      .addCase(searchApprovedBusinesses.pending, (state) => { state.searchLoading = true; })
      .addCase(searchApprovedBusinesses.fulfilled, (state, action) => { state.searchLoading = false; state.searchApprovedResults = action.payload; })
      .addCase(searchApprovedBusinesses.rejected, (state) => { state.searchLoading = false; })

      .addCase(searchPendingBusinesses.pending, (state) => { state.searchLoading = true; })
      .addCase(searchPendingBusinesses.fulfilled, (state, action) => { state.searchLoading = false; state.searchPendingResults = action.payload; })
      .addCase(searchPendingBusinesses.rejected, (state) => { state.searchLoading = false; })

      .addCase(approveBusiness.fulfilled, (state, action) => {
  const b = state.all.find(b => b.id === action.payload.id);
  if (b) b.status = action.payload.status; // ACTIVE
})

      .addCase(rejectBusiness.fulfilled, (state, action) => {
        const b = state.all.find(b => b.id === action.payload.id);
        if (b) { b.status = "REJECTED"; b.rejectReason = action.payload.reason; }
      })
      .addCase(blockBusiness.fulfilled, (state, action) => {
        const b = state.all.find(b => b.id === action.payload.id);
        if (b) { b.status = "INACTIVE"; b.blockReason = action.payload.reason; }
      })
      .addCase(unblockBusiness.fulfilled, (state, action) => {
        const b = state.all.find(b => b.id === action.payload.id);
        if (b) { b.status = "ACTIVE"; b.blockReason = null; }
      })

      // TIN
      .addCase(acceptTIN.pending, (state) => { state.tinAccepting = true; })
      .addCase(acceptTIN.fulfilled, (state, action) => {
        state.tinAccepting = false;
        const b = state.all.find(b => b.id === action.payload.id);
        if (b) b.tinStatus = "ACCEPTED";
      })
      .addCase(acceptTIN.rejected, (state) => { state.tinAccepting = false; })

      .addCase(rejectTIN.pending, (state) => { state.tinRejecting = true; })
      .addCase(rejectTIN.fulfilled, (state, action) => {
        state.tinRejecting = false;
        const b = state.all.find(b => b.id === action.payload.id);
        if (b) { b.tinStatus = "REJECTED"; b.tinRejectReason = action.payload.reason; }
      })
      .addCase(rejectTIN.rejected, (state) => { state.tinRejecting = false; });
  },
});

export default businessesSlice.reducer;
