import { configureStore } from "@reduxjs/toolkit";

import transactionsReducer from "@/store/transactionsSlice";
import walletReducer from "@/store/walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
