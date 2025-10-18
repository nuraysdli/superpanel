// notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// Fetch
export const fetchBroadcasts = createAsyncThunk(
  "notifications/fetchBroadcasts",
  async () => {
    const res = await api.get("/api/notifications");
    return res.data;
  }
);

// Send
export const sendBroadcast = createAsyncThunk(
  "notifications/sendBroadcast",
  async (data) => {
    const res = await api.post("/api/notifications/admin/broadcast", data);
    return res.data;
  }
);

// DELETE
export const deleteBroadcast = createAsyncThunk(
  "notifications/deleteBroadcast",
  async (id) => {
    await api.delete(`/api/notifications/${id}`);
    return id; // ID-ni qaytarırıq ki, reducer-də list-dən çıxarda bilək
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchBroadcasts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBroadcasts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBroadcasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // SEND
      .addCase(sendBroadcast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendBroadcast.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.list = [action.payload, ...state.list]; // 🔹 yeni bildiriş dərhal görünsün
        }
      })
      .addCase(sendBroadcast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // DELETE
      .addCase(deleteBroadcast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBroadcast.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteBroadcast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default notificationsSlice.reducer;
