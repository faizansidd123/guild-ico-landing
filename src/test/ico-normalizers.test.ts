import { beforeEach, describe, expect, it, vi } from "vitest";

import { saleConfig } from "@/config/sale";
import {
  buildDefaultIcoDetails,
  buildDefaultUserIcoValue,
  buildMockTransactions,
  ensureIsoDate,
  isStablePayment,
  normalizeConversionQuote,
  normalizeEthCostQuote,
  normalizeIcoDetails,
  normalizeUserIcoValue,
  normalizeTransaction,
  normalizeTransactionsPayload,
  paginateTransactions,
  readTokenSymbol,
  toPaymentMethod,
  toTransactionStatus,
} from "@/lib/ico-normalizers";
import type { ConversionQuote, IcoDetails, UserTransaction } from "@/types/ico";

const fallbackIcoDetails: IcoDetails = {
  tokenName: "Guild Token",
  tokenSymbol: "$GILD",
  tokenAddress: "0xC106e3Af20B0742f713ef4c28810dF39E23DA070",
  tokenPriceUsd: 0.05,
  tokensPerEth: 20000,
  raisedUsd: 10,
  softCap: 50,
  hardCapUsd: 100,
  soldTokens: 100,
  remainingTokens: 900,
  progressPct: 10,
  saleStartsAt: "",
  saleEndsAt: "2026-12-31T23:59:59.000Z",
  minContributionEth: 0.01,
  maxContributionEth: 100,
  saleStatus: "active",
  saleResult: "",
  isActive: true,
  isFinalized: false,
  totalRaisedEth: 1,
  totalRaisedUsdt: 2,
  totalRaisedUsdc: 3,
};

const fallbackQuote: ConversionQuote = {
  paymentMethod: "ETH",
  amountIn: 10,
  amountEthEquivalent: 0.5,
  tokenAmount: 1000,
  tokenPriceUsd: 0.05,
  tokensPerEth: 20000,
  usdValue: 50,
  tokenSymbol: "$GILD",
};

const fallbackUserIcoValue = {
  buyer: "0x0000000000000000000000000000000000000009",
  tokens: 0,
  eth: 0,
  usdc: 0,
  usdt: 0,
};

const fallbackTransactions: UserTransaction[] = [
  {
    id: "fallback-1",
    walletAddress: "0x0000000000000000000000000000000000000001",
    txHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    chain: "Ethereum",
    paymentMethod: "ETH",
    amountIn: 1,
    amountEthEquivalent: 1,
    tokenAmount: 20000,
    usdValue: 1000,
    status: "confirmed",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-2",
    walletAddress: "0x0000000000000000000000000000000000000002",
    txHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    chain: "Ethereum",
    paymentMethod: "USDC",
    amountIn: 200,
    amountEthEquivalent: 0.2,
    tokenAmount: 4000,
    usdValue: 200,
    status: "pending",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("ico-normalizers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T00:00:00.000Z"));
  });

  it("buildDefaultIcoDetails mirrors sale config values", () => {
    const details = buildDefaultIcoDetails();

    expect(details.tokenName).toBe(saleConfig.tokenName);
    expect(details.tokenSymbol).toBe(saleConfig.tokenSymbol);
    expect(details.tokenAddress).toBe(saleConfig.walletTokenAddress);
    expect(details.tokenPriceUsd).toBe(saleConfig.tokenPriceUsd);
    expect(details.tokensPerEth).toBe(saleConfig.tokensPerEth);
    expect(details.hardCapUsd).toBe(saleConfig.hardCapUsd);
    expect(details.remainingTokens).toBe(saleConfig.totalTokensForSale);
  });

  it("buildDefaultUserIcoValue initializes empty wallet claim values", () => {
    const result = buildDefaultUserIcoValue("0xabc");

    expect(result).toEqual({
      buyer: "0xabc",
      tokens: 0,
      eth: 0,
      usdc: 0,
      usdt: 0,
    });
  });

  it("ensureIsoDate normalizes valid values", () => {
    const value = ensureIsoDate("2026-01-01T10:00:00Z", "2026-01-01T00:00:00.000Z");

    expect(value).toBe("2026-01-01T10:00:00.000Z");
  });

  it("ensureIsoDate returns fallback for invalid values", () => {
    const fallback = "2026-01-01T00:00:00.000Z";
    expect(ensureIsoDate("not-a-date", fallback)).toBe(fallback);
  });

  it("readTokenSymbol accepts valid token symbols", () => {
    expect(readTokenSymbol({ tokenSymbol: "GILD" }, "$GILD")).toBe("GILD");
    expect(readTokenSymbol({ symbol: "$GILD" }, "GILD")).toBe("$GILD");
    expect(readTokenSymbol({ ticker: "GILD-1" }, "FALLBACK")).toBe("GILD-1");
  });

  it("readTokenSymbol falls back for invalid symbols", () => {
    expect(readTokenSymbol({ tokenSymbol: "INVALID SYMBOL" }, "GILD")).toBe("GILD");
    expect(readTokenSymbol({ tokenSymbol: "" }, "GILD")).toBe("GILD");
  });

  it("toPaymentMethod maps values with defaults", () => {
    expect(toPaymentMethod("ETH")).toBe("ETH");
    expect(toPaymentMethod("USDT")).toBe("USDT");
    expect(toPaymentMethod("USDC")).toBe("USDC");
    expect(toPaymentMethod("base")).toBe("ETH");
    expect(toPaymentMethod("something-else")).toBe("ETH");
  });

  it("isStablePayment detects only USDT and USDC", () => {
    expect(isStablePayment("USDT")).toBe(true);
    expect(isStablePayment("USDC")).toBe(true);
    expect(isStablePayment("ETH")).toBe(false);
  });

  it("toTransactionStatus normalizes statuses", () => {
    expect(toTransactionStatus("confirmed")).toBe("confirmed");
    expect(toTransactionStatus("COMPLETED")).toBe("confirmed");
    expect(toTransactionStatus("successful")).toBe("confirmed");
    expect(toTransactionStatus("failed")).toBe("failed");
    expect(toTransactionStatus("rejected")).toBe("failed");
    expect(toTransactionStatus("unknown")).toBe("pending");
  });

  it("normalizeIcoDetails returns fallback for non-object payload", () => {
    const result = normalizeIcoDetails(null, fallbackIcoDetails);
    expect(result).toEqual(fallbackIcoDetails);
  });

  it("normalizeIcoDetails reads payload and alternative key variants", () => {
    const result = normalizeIcoDetails(
      {
        data: {
          token_name: "Guild Prime",
          token_symbol: "GPR",
          token_address: "0x00000000000000000000000000000000000000aa",
          token_price_usd: "0.1",
          tokens_per_eth: "12000",
          totalRaisedETH: "10",
          total_raised_usdt: "1000",
          total_raised_usdc: "500",
          raised_usd: "250000",
          soft_cap: "500",
          hard_cap_usd: "1000000",
          sold_tokens: "250000",
          remaining_tokens: "750000",
          sale_starts_at: "2026-05-01T00:00:00Z",
          sale_ends_at: "2026-06-01T00:00:00Z",
          min_contribution_eth: "0.1",
          max_contribution_eth: "50",
          sale_status: "ENDED",
          sale_result: "SUCCESS",
          is_active: false,
          is_finalized: true,
        },
      },
      fallbackIcoDetails,
    );

    expect(result.tokenName).toBe("Guild Prime");
    expect(result.tokenSymbol).toBe("GPR");
    expect(result.tokenAddress).toBe("0x00000000000000000000000000000000000000aa");
    expect(result.tokenPriceUsd).toBe(0.1);
    expect(result.tokensPerEth).toBe(12000);
    expect(result.raisedUsd).toBe(250000);
    expect(result.softCap).toBe(500);
    expect(result.hardCapUsd).toBe(1000000);
    expect(result.soldTokens).toBe(250000);
    expect(result.remainingTokens).toBe(750000);
    expect(result.progressPct).toBe(25);
    expect(result.saleStartsAt).toBe("2026-05-01T00:00:00.000Z");
    expect(result.saleStatus).toBe("ended");
    expect(result.saleResult).toBe("success");
    expect(result.isActive).toBe(false);
    expect(result.isFinalized).toBe(true);
  });

  it("normalizeIcoDetails clamps progress and remaining tokens", () => {
    const result = normalizeIcoDetails(
      {
        data: {
          progressPct: 999,
          remainingTokens: -100,
        },
      },
      fallbackIcoDetails,
    );

    expect(result.progressPct).toBe(100);
    expect(result.remainingTokens).toBe(0);
  });

  it("normalizeIcoDetails derives raisedUsd from per-currency totals when the API omits it", () => {
    const result = normalizeIcoDetails(
      {
        data: {
          tokenPriceUsd: "0.25",
          tokensPerEth: "1000",
          totalRaisedETH: "2",
          totalRaisedUSDT: "100",
          totalRaisedUSDC: "50",
        },
      },
      fallbackIcoDetails,
    );

    expect(result.raisedUsd).toBe(650);
  });

  it("normalizeUserIcoValue returns fallback for invalid payload", () => {
    expect(normalizeUserIcoValue(null, fallbackUserIcoValue)).toEqual(fallbackUserIcoValue);
  });

  it("normalizeUserIcoValue reads nested payload values", () => {
    const result = normalizeUserIcoValue(
      {
        data: {
          buyer: "0xc78aB5dCF94fC86602C42cbF87baE157Dd0D79dc",
          tokens: "3.0",
          eth: "0.0",
          usdc: "1.00024",
          usdt: "2.001156",
        },
      },
      fallbackUserIcoValue,
    );

    expect(result.buyer).toBe("0xc78aB5dCF94fC86602C42cbF87baE157Dd0D79dc");
    expect(result.tokens).toBe(3);
    expect(result.eth).toBe(0);
    expect(result.usdc).toBe(1.00024);
    expect(result.usdt).toBe(2.001156);
  });

  it("normalizeConversionQuote returns fallback for invalid payload", () => {
    expect(normalizeConversionQuote(undefined, fallbackQuote)).toEqual(fallbackQuote);
  });

  it("normalizeConversionQuote maps nested data payload", () => {
    const result = normalizeConversionQuote(
      {
        data: {
          paymentMethod: "USDT",
          amountIn: "150",
          amountEthEquivalent: "0.1",
          tokenAmount: "3000",
          tokenPriceUsd: "0.05",
          tokensPerEth: "20000",
          usdValue: "150",
          tokenSymbol: "GILD",
        },
      },
      fallbackQuote,
    );

    expect(result.paymentMethod).toBe("USDT");
    expect(result.amountIn).toBe(150);
    expect(result.amountEthEquivalent).toBe(0.1);
    expect(result.tokenAmount).toBe(3000);
    expect(result.usdValue).toBe(150);
    expect(result.tokenSymbol).toBe("GILD");
  });

  it("normalizeEthCostQuote returns fallback for invalid payload", () => {
    const result = normalizeEthCostQuote(null, fallbackQuote);
    expect(result).toEqual(fallbackQuote);
  });

  it("normalizeEthCostQuote overrides ETH-specific fields", () => {
    const result = normalizeEthCostQuote(
      {
        data: {
          token: "100",
          amount: "0.2",
        },
      },
      fallbackQuote,
    );

    expect(result.paymentMethod).toBe("ETH");
    expect(result.amountIn).toBe(100);
    expect(result.tokenAmount).toBe(100);
    expect(result.amountEthEquivalent).toBe(0.2);
    expect(result.usdValue).toBe(100 * fallbackQuote.tokenPriceUsd);
  });

  it("buildMockTransactions creates stable mock transaction set", () => {
    const transactions = buildMockTransactions();

    expect(transactions).toHaveLength(72);
    expect(transactions[0].id).toBe("mock-tx-1");
    expect(transactions[0].walletAddress.startsWith("0x")).toBe(true);
    expect(transactions[0].txHash.startsWith("0x")).toBe(true);
    expect(["ETH", "USDT", "USDC"]).toContain(transactions[0].paymentMethod);
  });

  it("paginateTransactions slices and reports page metadata", () => {
    const paginated = paginateTransactions(fallbackTransactions, 1, 1);

    expect(paginated.items).toHaveLength(1);
    expect(paginated.total).toBe(2);
    expect(paginated.page).toBe(1);
    expect(paginated.pageSize).toBe(1);
    expect(paginated.totalPages).toBe(2);
  });

  it("paginateTransactions clamps page and page size", () => {
    const paginated = paginateTransactions(fallbackTransactions, 99, 0);

    expect(paginated.page).toBe(2);
    expect(paginated.pageSize).toBe(1);
    expect(paginated.items).toHaveLength(1);
  });

  it("normalizeTransaction builds consistent transaction model", () => {
    const result = normalizeTransaction(
      {
        _id: "69e614dfae905aaac5e32c64",
        walletAddress: "0xb2f8dd8b135a10d258ad169d65fe5b69a3cb0c5b",
        icoId: {
          name: "$GILD",
        },
        currency: "USDC",
        amount: "1.008357",
        tokens: "5.45",
        transactionHash: "0x7d835423daab50822b17c03e0967e5e1dc9b446caa5db839ac3cda1995e31897",
        type: "PURCHASE",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:01:00Z",
      },
      1,
    );

    expect(result.id).toBe("69e614dfae905aaac5e32c64");
    expect(result.paymentMethod).toBe("USDC");
    expect(result.amountIn).toBe(1.008357);
    expect(result.amountRaw).toBe(1.008357);
    expect(result.currency).toBe("USDC");
    expect(result.transactionType).toBe("PURCHASE");
    expect(result.icoName).toBe("$GILD");
    expect(result.txHash).toBe("0x7d835423daab50822b17c03e0967e5e1dc9b446caa5db839ac3cda1995e31897");
    expect(result.status).toBe("confirmed");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-01T00:01:00.000Z");
  });

  it("normalizeTransaction fills defaults and fallback id", () => {
    const result = normalizeTransaction({}, 9);

    expect(result.id).toBe("tx-9");
    expect(result.walletAddress).toBe("N/A");
    expect(result.txHash).toBe("N/A");
    expect(result.status).toBe("pending");
  });

  it("normalizeTransactionsPayload falls back to mock pagination for non-record payload", () => {
    const result = normalizeTransactionsPayload(null, 1, 10, fallbackTransactions);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it("normalizeTransactionsPayload handles data.items payload shape", () => {
    const result = normalizeTransactionsPayload(
      {
        data: {
          items: [
            {
              id: "a",
              walletAddress: "0x0000000000000000000000000000000000000004",
              txHash: "0xa",
              chain: "Ethereum",
              paymentMethod: "ETH",
              amountIn: 1,
              amountEthEquivalent: 1,
              tokenAmount: 20000,
              usdValue: 1000,
              status: "pending",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
          pagination: {
            page: 2,
            perPage: 20,
            totalCount: 41,
          },
        },
      },
      1,
      10,
      fallbackTransactions,
    );

    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.total).toBe(41);
    expect(result.totalPages).toBe(3);
  });

  it("normalizeTransactionsPayload handles top-level transactions array", () => {
    const result = normalizeTransactionsPayload(
      {
        transactions: [
          {
            id: "b",
            walletAddress: "0x0000000000000000000000000000000000000005",
            txHash: "0xb",
            status: "failed",
          },
        ],
        pages: 10,
      },
      3,
      5,
      fallbackTransactions,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("b");
    expect(result.items[0].status).toBe("failed");
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(5);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(10);
  });

  it("normalizeTransactionsPayload supports data.results and pageCount", () => {
    const result = normalizeTransactionsPayload(
      {
        data: {
          results: [
            {
              id: "r1",
              wallet: "0x0000000000000000000000000000000000000006",
              hash: "0xr1",
              method: "USDT",
              amount: "500",
              state: "success",
            },
          ],
          pageIndex: 4,
          limit: 25,
          count: 250,
          pageCount: 10,
        },
      },
      1,
      10,
      fallbackTransactions,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("r1");
    expect(result.items[0].paymentMethod).toBe("USDT");
    expect(result.items[0].status).toBe("confirmed");
    expect(result.page).toBe(4);
    expect(result.pageSize).toBe(25);
    expect(result.total).toBe(250);
    expect(result.totalPages).toBe(10);
  });
});
