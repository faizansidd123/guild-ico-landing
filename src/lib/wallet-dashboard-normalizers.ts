import { siteConfig } from "@/config/site";
import { toFiniteNumber } from "@/lib/number-utils";
import { isRecord } from "@/lib/type-guards";
import type {
  OwnedNftsApiResponse,
  TokenBalancesApiResponse,
  TransactionsApiResponse,
  TransactionsPayload,
  WalletNftItem,
  WalletTokenBalanceItem,
  WalletTransactionItem,
  WalletTransactionsPage,
} from "@/types/wallet-dashboard";

const DEFAULT_TOTAL_PAGES = 1;

const getGatewayBaseUrl = () => {
  return siteConfig.wallet.ipfsGatewayBaseUrl.replace(/\/+$/, "");
};

const toTransactionsPayload = (response: TransactionsApiResponse | null): TransactionsPayload => {
  if (!response) {
    return { data: [] };
  }

  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      pagination: response.pagination,
    };
  }

  if (isRecord(response.data)) {
    return response.data as TransactionsPayload;
  }

  return {
    data: Array.isArray(response.transactions) ? response.transactions : [],
    pagination: response.pagination,
  };
};

export const resolveNftArtworkUrl = (nft: WalletNftItem): string => {
  const candidate =
    nft.image?.originalUrl ||
    nft.image?.pngUrl ||
    nft.image?.thumbnailUrl ||
    nft.raw?.metadata?.artwork ||
    nft.raw?.metadata?.image ||
    "";

  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }

  if (candidate.startsWith("ipfs://")) {
    return `${getGatewayBaseUrl()}/${candidate.replace("ipfs://", "")}`;
  }

  return `${getGatewayBaseUrl()}/${candidate}`;
};

export const normalizeWalletNfts = (response: OwnedNftsApiResponse): WalletNftItem[] => {
  const payload = isRecord(response.data) ? response.data : response;
  const list = payload.ownedNfts;
  return Array.isArray(list) ? list : [];
};

export const normalizeWalletTokenBalances = (response: TokenBalancesApiResponse): WalletTokenBalanceItem[] => {
  if (Array.isArray(response.data)) {
    return response.data.map((item) => ({
      ...item,
      contractAddress: item.contractAddress || item.tokenAddress || undefined,
    }));
  }

  const payload = isRecord(response.data) ? response.data : response;
  const list = Array.isArray(payload.tokenBalances)
    ? payload.tokenBalances
    : Array.isArray(payload.tokens)
      ? payload.tokens
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];

  return list.map((item) => ({
    ...item,
    contractAddress: item.contractAddress || item.tokenAddress || undefined,
  }));
};

export const normalizeWalletTransactions = (response: TransactionsApiResponse): WalletTransactionsPage => {
  const payload = toTransactionsPayload(response);
  const list = Array.isArray(payload.data) ? payload.data : [];
  const totalPagesValue =
    toFiniteNumber(payload.pagination?.totalPages ?? payload.pagination?.pages) ||
    DEFAULT_TOTAL_PAGES;
  const totalPages = totalPagesValue > 0 ? Math.trunc(totalPagesValue) : DEFAULT_TOTAL_PAGES;

  return {
    items: list,
    totalPages,
  };
};

export const resolveWalletTransactionTitle = (tx: WalletTransactionItem, index: number): string => {
  if (tx.baseCurrencyAmount && tx.baseCurrency?.code) {
    return `${tx.baseCurrencyAmount} ${String(tx.baseCurrency.code).toUpperCase()}`;
  }

  if (tx.quoteCurrencyAmount && tx.currency?.code) {
    return `${tx.quoteCurrencyAmount} ${String(tx.currency.code).toUpperCase()}`;
  }

  if (tx.amount) {
    return String(tx.amount);
  }

  return `Transaction #${index + 1}`;
};

export const resolveWalletTransactionStatus = (tx: WalletTransactionItem): string => {
  return tx.status || tx.state || "Unknown";
};

export const resolveWalletTransactionKey = (tx: WalletTransactionItem, index: number): string => {
  const status = resolveWalletTransactionStatus(tx);
  return tx.id || tx.transactionId || `${status}-${index}`;
};
