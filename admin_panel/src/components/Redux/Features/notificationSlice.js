import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

export const fetchBroadcasts = createAsyncThunk("notifications/fetchBroadcasts", async () => {
  const res = await api.get("/api/notifications");
  return res.data;
});

export const sendBroadcast = createAsyncThunk("notifications/sendBroadcast", async (data) => {
  const res = await api.post("/api/notifications/admin/broadcast", data);
  return res.data;
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBroadcasts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBroadcasts.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchBroadcasts.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })

      .addCase(sendBroadcast.pending, (state) => { state.loading = true; })
      .addCase(sendBroadcast.fulfilled, (state, action) => { state.loading = false; state.list.push(action.payload); })
      .addCase(sendBroadcast.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  },
});

export default notificationsSlice.reducer;
