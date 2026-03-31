import { siteConfig } from "@/config/site";
import { fetchJson, resolveEndpoint } from "@/lib/http-client";
import {
  normalizeWalletNfts,
  normalizeWalletTokenBalances,
  normalizeWalletTransactions,
} from "@/lib/wallet-dashboard-normalizers";
import type {
  OwnedNftsApiResponse,
  TokenBalancesApiResponse,
  TransactionsApiResponse,
  WalletNftItem,
  WalletTokenBalanceItem,
  WalletTransactionItem,
  WalletTransactionsPage,
} from "@/types/wallet-dashboard";

const resolveWalletEndpoint = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (!siteConfig.wallet.apiBaseUrl) {
    throw new Error("Wallet API base URL is not configured.");
  }

  return resolveEndpoint(path, siteConfig.wallet.apiBaseUrl);
};

const fetchWalletJson = async <T>(path: string, query?: Record<string, string | number>) => {
  const endpoint = resolveWalletEndpoint(path);

  return fetchJson<T>(endpoint, {
    method: "GET",
    query,
    retries: 1,
    timeoutMs: 15_000,
  });
};

export const fetchWalletNfts = async (): Promise<WalletNftItem[]> => {
  const response = await fetchWalletJson<OwnedNftsApiResponse>(siteConfig.wallet.apiPaths.nfts);
  return normalizeWalletNfts(response);
};

export const fetchWalletTokenBalances = async (walletAddress: string): Promise<WalletTokenBalanceItem[]> => {
  const normalizedWalletAddress = walletAddress.trim();
  if (!normalizedWalletAddress) {
    return [];
  }

  const response = await fetchWalletJson<TokenBalancesApiResponse>(
    siteConfig.wallet.apiPaths.tokenBalances,
    {
      walletAddress: normalizedWalletAddress,
    },
  );

  return normalizeWalletTokenBalances(response);
};

export const fetchWalletTransactions = async (walletAddress: string): Promise<WalletTransactionsPage> => {
  const normalizedWalletAddress = walletAddress.trim();
  if (!normalizedWalletAddress) {
    return {
      items: [],
      totalPages: 1,
    };
  }

  const response = await fetchWalletJson<TransactionsApiResponse>(
    siteConfig.wallet.apiPaths.transactions,
    {
      walletAddress: normalizedWalletAddress,
    },
  );

  return normalizeWalletTransactions(response);
};

export type {
  WalletNftItem,
  WalletTokenBalanceItem,
  WalletTransactionItem,
  WalletTransactionsPage,
} from "@/types/wallet-dashboard";
