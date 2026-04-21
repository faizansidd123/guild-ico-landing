import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchUserTransactions } from "@/lib/ico-api";
import { QUERY_DEFAULTS } from "@/lib/query-defaults";

type UseUserTransactionsParams = {
  page: number;
  pageSize: number;
  walletAddress?: string;
};

export const USER_TRANSACTIONS_QUERY_KEY = ["user-transactions"];

export const useUserTransactions = ({ page, pageSize, walletAddress }: UseUserTransactionsParams) => {
  const normalizedWalletAddress = (walletAddress || "").trim();

  return useQuery({
    queryKey: [...USER_TRANSACTIONS_QUERY_KEY, normalizedWalletAddress, page, pageSize],
    queryFn: () =>
      fetchUserTransactions({
        page,
        pageSize,
        walletAddress: normalizedWalletAddress,
      }),
    placeholderData: keepPreviousData,
    staleTime: QUERY_DEFAULTS.userTransactions.staleTime,
    refetchInterval: QUERY_DEFAULTS.userTransactions.refetchInterval,
  });
};
