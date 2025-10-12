import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// 🔹 İstifadəçiləri gətir
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const res = await api.get("/api/persons", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data;
});

// 🔹 İstifadəçini sil
export const deleteUser = createAsyncThunk("users/deleteUser", async (id) => {
  await api.delete(`/api/persons/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return id;
});

// 🔹 İstifadəçini yenilə (partial update dəstəyi)
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const existingUser = state.users.list.find((u) => u.id === id);
      if (!existingUser) throw new Error("İstifadəçi tapılmadı");

      // Mövcud data ilə merge et və bütün lazımlı sahələri göndər
      const body = {
        id: existingUser.id,
        name: userData.name ?? existingUser.name,
        surname: userData.surname ?? existingUser.surname,
        email: userData.email ?? existingUser.email,
        phone: userData.phone ?? existingUser.phone,
        birthday: userData.birthday ?? existingUser.birthday,
        hasBusiness: existingUser.hasBusiness ?? false, // lazımdırsa
      };

      const res = await api.put(`/api/persons/${id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Slice
const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default usersSlice.reducer;
