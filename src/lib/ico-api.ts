import { saleConfig } from "@/config/sale";
import { getEnvValue } from "@/lib/env-utils";
import { fetchJson, withQueryParams } from "@/lib/http-client";
import { MIN_NON_ZERO } from "@/lib/number-utils";
import {
  buildDefaultIcoDetails,
  buildDefaultUserIcoValue,
  buildMockTransactions,
  isStablePayment,
  normalizeConversionQuote,
  normalizeEthCostQuote,
  normalizeIcoDetails,
  normalizeUserIcoValue,
  normalizeTransactionsPayload,
} from "@/lib/ico-normalizers";
import type {
  ConversionQuote,
  IcoDetails,
  PaginatedTransactions,
  PaymentMethod,
  UserIcoValue,
} from "@/types/ico";

type TransactionQuery = {
  page: number;
  pageSize: number;
  walletAddress?: string;
};

type ConversionAmountType = "pay" | "token";

type ConversionQuery = {
  amount: number;
  paymentMethod: PaymentMethod;
  amountType?: ConversionAmountType;
};

const ICO_DETAILS_DEFAULT_ENDPOINT = "/ico";
const USER_TRANSACTIONS_DEFAULT_ENDPOINT = "/ico/user-transaction";
const USER_VALUE_DEFAULT_ENDPOINT = "/ico/user-value";
const ICO_COST_DEFAULT_ENDPOINT = "/ico/cost";

const resolveBaseUrl = () => getEnvValue("NEXT_PUBLIC_BASE_URL");

const resolveIcoDetailsUrl = (): string => {
  if (saleConfig.icoDetailsApiUrl.trim().length > 0) {
    return saleConfig.icoDetailsApiUrl;
  }

  const baseUrl = resolveBaseUrl().trim();
  if (baseUrl.length > 0) {
    return `${baseUrl.replace(/\/+$/, "")}${ICO_DETAILS_DEFAULT_ENDPOINT}`;
  }

  return ICO_DETAILS_DEFAULT_ENDPOINT;
};

const resolveUserTransactionsUrl = (): string => {
  if (saleConfig.transactionsApiUrl.trim().length > 0) {
    return saleConfig.transactionsApiUrl;
  }

  const baseUrl = resolveBaseUrl().trim();
  if (baseUrl.length > 0) {
    return `${baseUrl.replace(/\/+$/, "")}${USER_TRANSACTIONS_DEFAULT_ENDPOINT}`;
  }

  return USER_TRANSACTIONS_DEFAULT_ENDPOINT;
};

const resolveUserValueUrl = (): string => {
  if (saleConfig.userValueApiUrl.trim().length > 0) {
    return saleConfig.userValueApiUrl;
  }

  const baseUrl = resolveBaseUrl().trim();
  if (baseUrl.length > 0) {
    return `${baseUrl.replace(/\/+$/, "")}${USER_VALUE_DEFAULT_ENDPOINT}`;
  }

  return USER_VALUE_DEFAULT_ENDPOINT;
};

const resolveIcoCostUrl = (): string => {
  const baseUrl = resolveBaseUrl().trim();
  if (baseUrl.length > 0) {
    return `${baseUrl.replace(/\/+$/, "")}${ICO_COST_DEFAULT_ENDPOINT}`;
  }
  return ICO_COST_DEFAULT_ENDPOINT;
};

const fetchIcoApiJson = async (url: string): Promise<unknown> => {
  return fetchJson<unknown>(url, {
    method: "GET",
    retries: 1,
    timeoutMs: 15_000,
  });
};

const toCostCurrency = (paymentMethod: PaymentMethod) => {
  return paymentMethod === "ETH" ? "eth" : paymentMethod.toLowerCase();
};

const buildLocalConversionQuote = async (
  amount: number,
  paymentMethod: PaymentMethod,
  amountType: ConversionAmountType,
): Promise<ConversionQuote> => {
  const defaultDetails = buildDefaultIcoDetails();
  let icoDetails = defaultDetails;
  try {
    const payload = await fetchIcoApiJson(resolveIcoDetailsUrl());
    icoDetails = normalizeIcoDetails(payload, defaultDetails);
  } catch {
    icoDetails = defaultDetails;
  }

  const tokenPriceUsd = Math.max(MIN_NON_ZERO, icoDetails.tokenPriceUsd || saleConfig.tokenPriceUsd || MIN_NON_ZERO);
  const tokensPerEth = Math.max(MIN_NON_ZERO, icoDetails.tokensPerEth || saleConfig.tokensPerEth || MIN_NON_ZERO);

  const payAmount =
    amountType === "pay"
      ? amount
      : paymentMethod === "ETH"
        ? amount / tokensPerEth
        : isStablePayment(paymentMethod)
          ? amount * tokenPriceUsd
          : amount;

  const tokenAmount =
    amountType === "token"
      ? amount
      : paymentMethod === "ETH"
        ? amount * tokensPerEth
        : isStablePayment(paymentMethod)
          ? amount / tokenPriceUsd
          : amount;

  const amountEthEquivalent = paymentMethod === "ETH" ? payAmount : tokenAmount / tokensPerEth;
  const usdValue = tokenAmount * tokenPriceUsd;

  return {
    paymentMethod,
    amountIn: payAmount,
    amountEthEquivalent,
    tokenAmount,
    tokenPriceUsd,
    tokensPerEth,
    usdValue,
    tokenSymbol: icoDetails.tokenSymbol,
  };
};

const fetchPayCostForTokenAmount = async ({
  tokenAmount,
  paymentMethod,
  fallbackPayAmount,
}: {
  tokenAmount: number;
  paymentMethod: PaymentMethod;
  fallbackPayAmount: number;
}) => {
  const safeTokenAmount = Number.isFinite(tokenAmount) && tokenAmount > 0 ? tokenAmount : 0;
  if (safeTokenAmount <= 0) {
    return {
      tokenAmount: safeTokenAmount,
      payAmount: fallbackPayAmount,
    };
  }

  try {
    const url = withQueryParams(resolveIcoCostUrl(), {
      token: safeTokenAmount,
      currency: toCostCurrency(paymentMethod),
    });
    const payload = await fetchIcoApiJson(url);
    const costQuote = normalizeEthCostQuote(payload, {
      paymentMethod: "ETH",
      amountIn: safeTokenAmount,
      amountEthEquivalent: fallbackPayAmount,
      tokenAmount: safeTokenAmount,
      tokenPriceUsd: saleConfig.tokenPriceUsd,
      tokensPerEth: saleConfig.tokensPerEth,
      usdValue: safeTokenAmount * saleConfig.tokenPriceUsd,
      tokenSymbol: saleConfig.tokenSymbol,
    });

    const quotedTokenAmount =
      Number.isFinite(costQuote.tokenAmount) && costQuote.tokenAmount > 0 ? costQuote.tokenAmount : safeTokenAmount;
    const quotedPayAmount =
      Number.isFinite(costQuote.amountEthEquivalent) && costQuote.amountEthEquivalent > 0
        ? costQuote.amountEthEquivalent
        : fallbackPayAmount;

    return {
      tokenAmount: quotedTokenAmount,
      payAmount: quotedPayAmount,
    };
  } catch {
    return {
      tokenAmount: safeTokenAmount,
      payAmount: fallbackPayAmount,
    };
  }
};

const buildQuoteFromTokenInput = async (
  fallback: ConversionQuote,
  paymentMethod: PaymentMethod,
): Promise<ConversionQuote> => {
  const tokenAmountInput = Number.isFinite(fallback.tokenAmount) && fallback.tokenAmount > 0 ? fallback.tokenAmount : 0;
  if (tokenAmountInput <= 0) {
    return fallback;
  }

  const localPayAmount =
    paymentMethod === "ETH"
      ? tokenAmountInput / Math.max(MIN_NON_ZERO, fallback.tokensPerEth)
      : tokenAmountInput * fallback.tokenPriceUsd;

  const costQuote = await fetchPayCostForTokenAmount({
    tokenAmount: tokenAmountInput,
    paymentMethod,
    fallbackPayAmount: localPayAmount,
  });

  const amountEthEquivalent =
    paymentMethod === "ETH"
      ? costQuote.payAmount
      : costQuote.tokenAmount / Math.max(MIN_NON_ZERO, fallback.tokensPerEth);

  return {
    ...fallback,
    paymentMethod,
    amountIn: costQuote.payAmount,
    tokenAmount: costQuote.tokenAmount,
    amountEthEquivalent,
    usdValue: costQuote.tokenAmount * fallback.tokenPriceUsd,
  };
};

const buildQuoteFromPayInput = async (
  fallback: ConversionQuote,
  paymentMethod: PaymentMethod,
): Promise<ConversionQuote> => {
  const payAmountInput = Number.isFinite(fallback.amountIn) && fallback.amountIn > 0 ? fallback.amountIn : 0;
  if (payAmountInput <= 0) {
    return fallback;
  }

  const localUnitCost = paymentMethod === "ETH" ? 1 / Math.max(MIN_NON_ZERO, fallback.tokensPerEth) : fallback.tokenPriceUsd;
  const unitCostQuote = await fetchPayCostForTokenAmount({
    tokenAmount: 1,
    paymentMethod,
    fallbackPayAmount: localUnitCost,
  });

  const unitCost =
    Number.isFinite(unitCostQuote.payAmount) && unitCostQuote.payAmount > 0
      ? unitCostQuote.payAmount / Math.max(MIN_NON_ZERO, unitCostQuote.tokenAmount)
      : localUnitCost;

  const tokenAmount = payAmountInput / Math.max(MIN_NON_ZERO, unitCost);
  const amountEthEquivalent =
    paymentMethod === "ETH" ? payAmountInput : tokenAmount / Math.max(MIN_NON_ZERO, fallback.tokensPerEth);

  return {
    ...fallback,
    paymentMethod,
    amountIn: payAmountInput,
    tokenAmount,
    amountEthEquivalent,
    usdValue: tokenAmount * fallback.tokenPriceUsd,
  };
};

const MOCK_TRANSACTIONS = buildMockTransactions();

export const fetchIcoDetails = async (): Promise<IcoDetails> => {
  const payload = await fetchIcoApiJson(resolveIcoDetailsUrl());
  return normalizeIcoDetails(payload, buildDefaultIcoDetails());
};

export const fetchUserIcoValue = async ({ walletAddress }: { walletAddress?: string }): Promise<UserIcoValue> => {
  const normalizedWalletAddress = (walletAddress || "").trim();
  const fallback = buildDefaultUserIcoValue(normalizedWalletAddress);

  if (normalizedWalletAddress.length === 0) {
    return fallback;
  }

  const url = withQueryParams(resolveUserValueUrl(), {
    walletAddress: normalizedWalletAddress,
  });
  const payload = await fetchIcoApiJson(url);
  return normalizeUserIcoValue(payload, fallback);
};

export const fetchConversionQuote = async ({ amount, paymentMethod, amountType = "pay" }: ConversionQuery): Promise<ConversionQuote> => {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const fallback = await buildLocalConversionQuote(safeAmount, paymentMethod, amountType);

  const baseQuote =
    amountType === "token"
      ? await buildQuoteFromTokenInput(fallback, paymentMethod)
      : await buildQuoteFromPayInput(fallback, paymentMethod);

  if (amountType === "token" || paymentMethod === "ETH") {
    return baseQuote;
  }

  if (!saleConfig.conversionApiUrl) {
    return baseQuote;
  }

  try {
    const url = withQueryParams(saleConfig.conversionApiUrl, {
      amount: safeAmount,
      paymentMethod,
      tokenSymbol: baseQuote.tokenSymbol,
    });
    const payload = await fetchIcoApiJson(url);
    return normalizeConversionQuote(payload, baseQuote);
  } catch {
    return baseQuote;
  }
};

export const fetchUserTransactions = async ({ page, pageSize, walletAddress }: TransactionQuery): Promise<PaginatedTransactions> => {
  const safePage = Math.max(1, Math.trunc(page));
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const normalizedWalletAddress = (walletAddress || "").trim();

  if (normalizedWalletAddress.length === 0) {
    return {
      items: [],
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      totalPages: 1,
    };
  }

  try {
    const url = withQueryParams(resolveUserTransactionsUrl(), {
      walletAddress: normalizedWalletAddress,
      page: safePage,
      limit: safePageSize,
    });
    const payload = await fetchIcoApiJson(url);
    return normalizeTransactionsPayload(payload, safePage, safePageSize, MOCK_TRANSACTIONS);
  } catch {
    return {
      items: [],
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      totalPages: 1,
    };
  }
};
