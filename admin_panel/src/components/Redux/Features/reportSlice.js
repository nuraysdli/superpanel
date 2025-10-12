import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";

// 🔹 Bütün reportları gətir
export const fetchReportTransactions = createAsyncThunk(
  "reports/fetchReportTransactions",
  async () => {
    const res = await api.get("/api/report-transactions");
    return res.data;
  }
);

// 🔹 Admin report-a cavab verir
export const answerReportTransaction = createAsyncThunk(
  "reports/answerReportTransaction",
  async ({ reportTransactionId, message }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/report-transactions/answer", {
        reportTransactionId,
        message,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cavab göndərilərkən xəta baş verdi"
      );
    }
  }
);

const reportTransactionsSlice = createSlice({
  name: "reports",
  initialState: {
    list: [],
    loading: false,
    error: null,
    answerLoading: false,
    answerSuccess: false,
  },
  reducers: {
    clearReportStatus: (state) => {
      state.answerLoading = false;
      state.answerSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔸 FETCH REPORTS
      .addCase(fetchReportTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReportTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 🔸 ANSWER REPORT
      .addCase(answerReportTransaction.pending, (state) => {
        state.answerLoading = true;
        state.answerSuccess = false;
        state.error = null;
      })
      .addCase(answerReportTransaction.fulfilled, (state) => {
        state.answerLoading = false;
        state.answerSuccess = true;
      })
      .addCase(answerReportTransaction.rejected, (state, action) => {
        state.answerLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportStatus } = reportTransactionsSlice.actions;
export default reportTransactionsSlice.reducer;
