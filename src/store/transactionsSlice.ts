import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { toPositiveInteger } from "@/lib/number-utils";

export type TransactionsState = {
  page: number;
  pageSize: number;
};

const initialState: TransactionsState = {
  page: 1,
  pageSize: 5,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactionsPage(state, action: PayloadAction<number>) {
      state.page = toPositiveInteger(action.payload, state.page);
    },
    setTransactionsPageSize(state, action: PayloadAction<number>) {
      state.pageSize = toPositiveInteger(action.payload, state.pageSize);
      state.page = 1;
    },
  },
});

export const { setTransactionsPage, setTransactionsPageSize } = transactionsSlice.actions;

export default transactionsSlice.reducer;
