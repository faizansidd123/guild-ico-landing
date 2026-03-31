export const QUERY_DEFAULTS = {
  saleStats: {
    staleTime: 15_000,
    refetchInterval: 30_000,
  },
  icoDetails: {
    staleTime: 15_000,
    refetchInterval: 30_000,
  },
  conversionQuote: {
    staleTime: 10_000,
    refetchInterval: 30_000,
  },
  userTransactions: {
    staleTime: 10_000,
    refetchInterval: 30_000,
  },
  userIcoValue: {
    staleTime: 10_000,
    refetchInterval: 30_000,
  },
  walletAssets: {
    staleTime: 20_000,
    refetchInterval: 60_000,
  },
} as const;

export const clampRefetchInterval = (value: number): number => {
  const normalized = Math.trunc(value);
  if (Number.isFinite(normalized) && normalized >= 0) {
    return normalized;
  }
  return 0;
};
