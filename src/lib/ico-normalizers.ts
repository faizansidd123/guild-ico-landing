import { saleConfig } from "@/config/sale";
import { MIN_NON_ZERO, clampPercentage, readBoolean, readNumber } from "@/lib/number-utils";
import { isRecord, readString, toLowerTrimmed, toUpperTrimmed } from "@/lib/type-guards";
import type {
  ConversionQuote,
  IcoDetails,
  PaginatedTransactions,
  PaymentMethod,
  UserIcoValue,
  UserTransaction,
  UserTransactionStatus,
} from "@/types/ico";

const TOKEN_SYMBOL_PATTERN = /^[A-Za-z0-9$_-]{1,16}$/;

export const ensureIsoDate = (value: string, fallback: string): string => {
  const timestamp = Date.parse(value);
  if (Number.isFinite(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  return fallback;
};

export const readTokenSymbol = (record: Record<string, unknown>, fallback: string): string => {
  const value = readString(record, ["symbol", "ticker", "tokenTicker", "tokenSymbol", "token_symbol"], fallback);
  const normalized = value.trim();
  if (TOKEN_SYMBOL_PATTERN.test(normalized)) {
    return normalized;
  }

  return fallback;
};

export const toPaymentMethod = (value: string): PaymentMethod => {
  const normalized = toUpperTrimmed(value);
  if (normalized === "USDT") return "USDT";
  if (normalized === "USDC") return "USDC";
  if (normalized === "BASE") return "ETH";
  return "ETH";
};

export const isStablePayment = (paymentMethod: PaymentMethod): boolean => {
  return paymentMethod === "USDC" || paymentMethod === "USDT";
};

export const toTransactionStatus = (value: string): UserTransactionStatus => {
  const normalized = toLowerTrimmed(value);

  if (["confirmed", "complete", "completed", "success", "successful", "purchase", "purchased"].includes(normalized)) {
    return "confirmed";
  }

  if (["failed", "error", "reverted", "rejected"].includes(normalized)) {
    return "failed";
  }

  return "pending";
};

export const buildDefaultIcoDetails = (): IcoDetails => ({
  tokenName: saleConfig.tokenName,
  tokenSymbol: saleConfig.tokenSymbol,
  tokenPriceUsd: saleConfig.tokenPriceUsd,
  tokensPerEth: saleConfig.tokensPerEth,
  raisedUsd: 0,
  hardCapUsd: saleConfig.hardCapUsd,
  soldTokens: 0,
  remainingTokens: saleConfig.totalTokensForSale,
  progressPct: 0,
  saleStartsAt: "",
  saleEndsAt: saleConfig.saleEndsAt,
  minContributionEth: saleConfig.minContributionEth,
  maxContributionEth: saleConfig.maxContributionEth,
  saleStatus: "",
  saleResult: "",
  isActive: true,
  isFinalized: false,
  totalRaisedEth: 0,
  totalRaisedUsdt: 0,
  totalRaisedUsdc: 0,
});

export const buildDefaultUserIcoValue = (walletAddress = ""): UserIcoValue => ({
  buyer: walletAddress,
  tokens: 0,
  eth: 0,
  usdc: 0,
  usdt: 0,
});

export const normalizeIcoDetails = (payload: unknown, fallback: IcoDetails): IcoDetails => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  const tokenPriceUsd = readNumber(data, ["tokenPriceUsd", "token_price_usd", "priceUsd", "tokenRate", "token_rate"], fallback.tokenPriceUsd);
  const tokensPerEth = readNumber(data, ["tokensPerEth", "tokens_per_eth", "conversionRate"], fallback.tokensPerEth);
  const totalRaisedEth = readNumber(data, ["totalRaisedETH", "totalRaisedEth", "total_raised_eth"], fallback.totalRaisedEth);
  const totalRaisedUsdt = readNumber(data, ["totalRaisedUSDT", "totalRaisedUsdt", "total_raised_usdt"], fallback.totalRaisedUsdt);
  const totalRaisedUsdc = readNumber(data, ["totalRaisedUSDC", "totalRaisedUsdc", "total_raised_usdc"], fallback.totalRaisedUsdc);
  const fallbackRaisedUsd = totalRaisedUsdt + totalRaisedUsdc + totalRaisedEth * tokensPerEth * tokenPriceUsd;
  const raisedUsd = readNumber(data, ["raisedUsd", "raised_usd", "totalRaisedUsd"], fallbackRaisedUsd || fallback.raisedUsd);
  const hardCapUsd = readNumber(data, ["hardCapUsd", "hard_cap_usd", "hardCap", "hard_cap"], fallback.hardCapUsd);
  const softCap = readNumber(data, ["softCapUsd", "soft_cap_usd", "softCap", "soft_cap"], fallback.softCap ?? Number.NaN);
  const soldTokens = readNumber(data, ["soldTokens", "sold_tokens", "totalTokensSold", "total_tokens_sold"], fallback.soldTokens);
  const remainingTokens = readNumber(
    data,
    ["remainingTokens", "remaining_tokens"],
    Math.max(0, saleConfig.totalTokensForSale - soldTokens),
  );
  const progressPct = readNumber(data, ["progressPct", "progress", "progress_pct"], (raisedUsd / Math.max(hardCapUsd, 1)) * 100);

  return {
    tokenName: readString(data, ["tokenName", "token_name", "name"], fallback.tokenName),
    tokenSymbol: readTokenSymbol(data, fallback.tokenSymbol),
    tokenPriceUsd,
    tokensPerEth,
    raisedUsd,
    hardCapUsd,
    softCap: Number.isFinite(softCap) ? softCap : undefined,
    soldTokens,
    remainingTokens: Math.max(0, remainingTokens),
    progressPct: clampPercentage(progressPct),
    saleStartsAt: ensureIsoDate(
      readString(data, ["saleStartsAt", "sale_starts_at", "startDate", "start_date", "startsAt", "start_at"], fallback.saleStartsAt),
      fallback.saleStartsAt,
    ),
    saleEndsAt: ensureIsoDate(readString(data, ["saleEndsAt", "sale_ends_at", "endDate", "end_date"], fallback.saleEndsAt), fallback.saleEndsAt),
    minContributionEth: readNumber(data, ["minContributionEth", "min_contribution_eth"], fallback.minContributionEth),
    maxContributionEth: readNumber(data, ["maxContributionEth", "max_contribution_eth"], fallback.maxContributionEth),
    saleStatus: toLowerTrimmed(readString(data, ["status", "saleStatus", "sale_status"], fallback.saleStatus)),
    saleResult: toLowerTrimmed(readString(data, ["result", "saleResult", "sale_result"], fallback.saleResult)),
    isActive: readBoolean(data, ["isActive", "is_active", "active"], fallback.isActive),
    isFinalized: readBoolean(data, ["isFinalized", "is_finalized", "finalized"], fallback.isFinalized),
    totalRaisedEth,
    totalRaisedUsdt,
    totalRaisedUsdc,
  };
};

export const normalizeUserIcoValue = (payload: unknown, fallback: UserIcoValue): UserIcoValue => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const data = isRecord(payload.data) ? payload.data : payload;

  return {
    buyer: readString(data, ["buyer", "walletAddress", "wallet_address", "wallet"], fallback.buyer),
    tokens: readNumber(data, ["tokens", "token", "tokenAmount", "token_amount"], fallback.tokens),
    eth: readNumber(data, ["eth", "native", "amountEth", "amount_eth"], fallback.eth),
    usdc: readNumber(data, ["usdc", "amountUsdc", "amount_usdc"], fallback.usdc),
    usdt: readNumber(data, ["usdt", "amountUsdt", "amount_usdt"], fallback.usdt),
  };
};

export const normalizeConversionQuote = (payload: unknown, fallback: ConversionQuote): ConversionQuote => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  return {
    paymentMethod: toPaymentMethod(readString(data, ["paymentMethod", "method"], fallback.paymentMethod)),
    amountIn: readNumber(data, ["amountIn", "amount", "amount_in"], fallback.amountIn),
    amountEthEquivalent: readNumber(data, ["amountEthEquivalent", "ethAmount", "eth_amount"], fallback.amountEthEquivalent),
    tokenAmount: readNumber(data, ["tokenAmount", "tokens", "amountOut", "amount_out"], fallback.tokenAmount),
    tokenPriceUsd: readNumber(data, ["tokenPriceUsd", "token_price_usd", "priceUsd"], fallback.tokenPriceUsd),
    tokensPerEth: readNumber(data, ["tokensPerEth", "tokens_per_eth", "rate"], fallback.tokensPerEth),
    usdValue: readNumber(data, ["usdValue", "amountUsd", "amount_usd"], fallback.usdValue),
    tokenSymbol: readString(data, ["tokenSymbol", "token_symbol"], fallback.tokenSymbol),
  };
};

export const normalizeEthCostQuote = (payload: unknown, fallback: ConversionQuote): ConversionQuote => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  const tokenAmount = readNumber(data, ["token", "tokenAmount", "tokens"], fallback.tokenAmount);
  const amountEthEquivalent = readNumber(data, ["amount", "ethAmount", "cost", "price"], fallback.amountEthEquivalent);

  return {
    ...fallback,
    paymentMethod: "ETH",
    amountIn: tokenAmount,
    tokenAmount,
    amountEthEquivalent,
    usdValue: tokenAmount * fallback.tokenPriceUsd,
  };
};

export const buildMockTransactions = (): UserTransaction[] => {
  return Array.from({ length: 72 }, (_, index) => {
    const cursor = index + 1;
    const paymentMethod: PaymentMethod = cursor % 3 === 0 ? "USDC" : cursor % 2 === 0 ? "USDT" : "ETH";
    const amountIn = isStablePayment(paymentMethod) ? 150 + cursor * 11 : Number((0.05 + (cursor % 11) * 0.18).toFixed(4));
    const amountEthEquivalent =
      isStablePayment(paymentMethod)
        ? amountIn / Math.max(MIN_NON_ZERO, saleConfig.tokensPerEth * saleConfig.tokenPriceUsd)
        : amountIn;
    const tokenAmount =
      isStablePayment(paymentMethod)
        ? amountIn / Math.max(MIN_NON_ZERO, saleConfig.tokenPriceUsd)
        : amountIn * saleConfig.tokensPerEth;
    const usdValue = tokenAmount * saleConfig.tokenPriceUsd;
    const status: UserTransactionStatus = cursor % 8 === 0 ? "failed" : cursor % 5 === 0 ? "pending" : "confirmed";

    return {
      id: `mock-tx-${cursor}`,
      walletAddress: `0x${(9_000_000 + cursor).toString(16).padStart(40, "0")}`,
      txHash: `0x${(70_000_000 + cursor * 31).toString(16).padStart(64, "0")}`,
      chain: "Ethereum",
      paymentMethod,
      amountIn,
      amountEthEquivalent,
      tokenAmount,
      usdValue,
      status,
      createdAt: new Date(Date.now() - cursor * 1000 * 60 * 23).toISOString(),
    } satisfies UserTransaction;
  });
};

export const paginateTransactions = (
  transactions: UserTransaction[],
  page: number,
  pageSize: number,
): PaginatedTransactions => {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const total = transactions.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize;

  return {
    items: transactions.slice(from, to),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
};

export const normalizeTransaction = (payload: unknown, fallbackId: number): UserTransaction => {
  const data = isRecord(payload) ? payload : {};
  const paymentMethod = toPaymentMethod(readString(data, ["paymentMethod", "payment_method", "method", "currency"], "ETH"));
  const amountInFallback = readNumber(data, ["amountIn", "amount", "amount_in"], 0);
  const tokenAmountFallback =
    isStablePayment(paymentMethod)
      ? amountInFallback / Math.max(MIN_NON_ZERO, saleConfig.tokenPriceUsd)
      : amountInFallback * saleConfig.tokensPerEth;
  const amountEthEquivalentFallback =
    isStablePayment(paymentMethod)
      ? amountInFallback / Math.max(MIN_NON_ZERO, saleConfig.tokensPerEth * saleConfig.tokenPriceUsd)
      : amountInFallback;

  const txHash = readString(data, ["txHash", "tx_hash", "hash", "transactionHash"], "");
  const createdAtRaw = readString(data, ["createdAt", "created_at", "timestamp", "time"], new Date().toISOString());

  return {
    id: readString(data, ["id", "_id", "transactionId", "transaction_id"], txHash || `tx-${fallbackId}`),
    walletAddress: readString(data, ["walletAddress", "wallet", "address", "account"], "N/A"),
    txHash: txHash || "N/A",
    chain: readString(data, ["chain", "network"], "Ethereum"),
    paymentMethod,
    amountIn: amountInFallback,
    amountEthEquivalent: readNumber(
      data,
      ["amountEthEquivalent", "amount_eth_equivalent", "ethAmount", "amountEth"],
      amountEthEquivalentFallback,
    ),
    tokenAmount: readNumber(data, ["tokenAmount", "token_amount", "tokens"], tokenAmountFallback),
    usdValue: readNumber(data, ["usdValue", "usd_value", "amountUsd", "amount_usd"], tokenAmountFallback * saleConfig.tokenPriceUsd),
    status: toTransactionStatus(readString(data, ["status", "state", "type"], "pending")),
    createdAt: ensureIsoDate(createdAtRaw, new Date().toISOString()),
  };
};

export const normalizeTransactionsPayload = (
  payload: unknown,
  page: number,
  pageSize: number,
  fallbackTransactions: UserTransaction[],
): PaginatedTransactions => {
  if (!isRecord(payload)) {
    return paginateTransactions(fallbackTransactions, page, pageSize);
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  const transactionsRaw = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.transactions)
        ? data.transactions
        : Array.isArray(data.results)
          ? data.results
          : [];

  const paginationSource = isRecord(data.pagination) ? data.pagination : data;
  const normalizedItems = transactionsRaw.map((item, index) => normalizeTransaction(item, index + 1));

  const normalizedPage = Math.max(1, Math.trunc(readNumber(paginationSource, ["page", "currentPage", "pageIndex"], page)));
  const normalizedPageSize = Math.max(1, Math.trunc(readNumber(paginationSource, ["pageSize", "perPage", "per_page", "limit"], pageSize)));
  const normalizedTotal = Math.max(
    normalizedItems.length,
    Math.trunc(readNumber(paginationSource, ["total", "count", "totalCount"], normalizedItems.length)),
  );
  const totalPagesValue = Math.trunc(readNumber(paginationSource, ["totalPages", "pages", "pageCount"], 0));
  const normalizedTotalPages =
    totalPagesValue > 0 ? totalPagesValue : Math.max(1, Math.ceil(normalizedTotal / Math.max(1, normalizedPageSize)));

  return {
    items: normalizedItems,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    total: normalizedTotal,
    totalPages: normalizedTotalPages,
  };
};
