import { describe, expect, it } from "vitest";

import {
  normalizeWalletNfts,
  normalizeWalletTokenBalances,
  normalizeWalletTransactions,
  resolveNftArtworkUrl,
  resolveWalletTransactionKey,
  resolveWalletTransactionStatus,
  resolveWalletTransactionTitle,
} from "@/lib/wallet-dashboard-normalizers";
import type {
  OwnedNftsApiResponse,
  TokenBalancesApiResponse,
  TransactionsApiResponse,
  WalletNftItem,
  WalletTransactionItem,
} from "@/types/wallet-dashboard";

describe("wallet-dashboard-normalizers", () => {
  it("resolveNftArtworkUrl returns http image URLs unchanged", () => {
    const nft: WalletNftItem = {
      image: {
        originalUrl: "https://cdn.example.com/image.png",
      },
    };

    expect(resolveNftArtworkUrl(nft)).toBe("https://cdn.example.com/image.png");
  });

  it("resolveNftArtworkUrl maps ipfs urls through configured gateway", () => {
    const nft: WalletNftItem = {
      image: {
        pngUrl: "ipfs://QmHash/image.png",
      },
    };

    expect(resolveNftArtworkUrl(nft)).toContain("QmHash/image.png");
  });

  it("resolveNftArtworkUrl supports raw metadata fallback", () => {
    const nft: WalletNftItem = {
      raw: {
        metadata: {
          artwork: "QmArtwork/file.png",
        },
      },
    };

    const value = resolveNftArtworkUrl(nft);
    expect(value).toContain("QmArtwork/file.png");
  });

  it("resolveNftArtworkUrl returns empty for missing artwork", () => {
    expect(resolveNftArtworkUrl({})).toBe("");
  });

  it("normalizeWalletNfts reads nested data list", () => {
    const payload: OwnedNftsApiResponse = {
      data: {
        ownedNfts: [{ tokenId: "1" }, { tokenId: "2" }],
      },
    };

    const result = normalizeWalletNfts(payload);

    expect(result).toHaveLength(2);
    expect(result[0].tokenId).toBe("1");
  });

  it("normalizeWalletNfts reads root list when data wrapper is missing", () => {
    const payload: OwnedNftsApiResponse = {
      ownedNfts: [{ tokenId: "A" }],
    };

    const result = normalizeWalletNfts(payload);

    expect(result).toHaveLength(1);
    expect(result[0].tokenId).toBe("A");
  });

  it("normalizeWalletTokenBalances supports direct array payload", () => {
    const payload: TokenBalancesApiResponse = {
      data: [{ contractAddress: "0xabc", tokenBalance: "100" }],
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0xabc");
  });

  it("normalizeWalletTokenBalances supports tokenBalances key", () => {
    const payload: TokenBalancesApiResponse = {
      data: {
        tokenBalances: [{ contractAddress: "0xdef", tokenBalance: "200" }],
      },
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0xdef");
  });

  it("normalizeWalletTokenBalances supports nested data key", () => {
    const payload: TokenBalancesApiResponse = {
      data: {
        data: [{ contractAddress: "0x123", tokenBalance: "300" }],
      },
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0x123");
  });

  it("normalizeWalletTokenBalances supports items key", () => {
    const payload: TokenBalancesApiResponse = {
      data: {
        items: [{ contractAddress: "0x456", tokenBalance: "400" }],
      },
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0x456");
  });

  it("normalizeWalletTokenBalances supports tokens key used by tokens-ico", () => {
    const payload: TokenBalancesApiResponse = {
      data: {
        tokens: [
          {
            tokenAddress: "0x322970ca118ef02f226577e68a279e90a081b555",
            tokenBalance: "9999999999999999999997.999753",
          },
          {
            tokenAddress: "0x6a387873fb15553c2806599ae344ad09a9bb59ee",
            tokenBalance: "9999999999999999999498.983473",
          },
        ],
      },
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(2);
    expect(result[0].contractAddress).toBe("0x322970ca118ef02f226577e68a279e90a081b555");
    expect(result[0].tokenBalance).toBe("9999999999999999999997.999753");
    expect(result[1].contractAddress).toBe("0x6a387873fb15553c2806599ae344ad09a9bb59ee");
    expect(result[1].tokenBalance).toBe("9999999999999999999498.983473");
  });

  it("normalizeWalletTokenBalances maps tokenAddress to contractAddress", () => {
    const payload: TokenBalancesApiResponse = {
      data: {
        data: [{ tokenAddress: "0x6a387873fb15553c2806599ae344ad09a9bb59ee", tokenBalance: "10000000000000000000000.0" }],
      },
    };

    const result = normalizeWalletTokenBalances(payload);

    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0x6a387873fb15553c2806599ae344ad09a9bb59ee");
    expect(result[0].tokenBalance).toBe("10000000000000000000000.0");
  });

  it("normalizeWalletTransactions supports array data payload", () => {
    const payload: TransactionsApiResponse = {
      data: [
        { id: "tx-1", status: "done" },
        { id: "tx-2", status: "pending" },
      ],
      pagination: {
        totalPages: 3,
      },
    };

    const result = normalizeWalletTransactions(payload);

    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(3);
  });

  it("normalizeWalletTransactions supports nested data payload", () => {
    const payload: TransactionsApiResponse = {
      data: {
        data: [{ id: "tx-3" }],
        pagination: {
          pages: 2,
        },
      },
    };

    const result = normalizeWalletTransactions(payload);

    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(2);
  });

  it("normalizeWalletTransactions supports transactions fallback key", () => {
    const payload: TransactionsApiResponse = {
      transactions: [{ id: "tx-4" }],
      pagination: {
        pages: 4,
      },
    };

    const result = normalizeWalletTransactions(payload);

    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(4);
  });

  it("normalizeWalletTransactions defaults total pages to 1", () => {
    const payload: TransactionsApiResponse = {
      data: {
        data: [{ id: "tx-5" }],
      },
    };

    const result = normalizeWalletTransactions(payload);

    expect(result.totalPages).toBe(1);
  });

  it("resolveWalletTransactionTitle prefers base currency details", () => {
    const transaction: WalletTransactionItem = {
      baseCurrencyAmount: 10,
      baseCurrency: { code: "eth" },
      quoteCurrencyAmount: 100,
      currency: { code: "usd" },
    };

    expect(resolveWalletTransactionTitle(transaction, 0)).toBe("10 ETH");
  });

  it("resolveWalletTransactionTitle falls back to quote currency", () => {
    const transaction: WalletTransactionItem = {
      quoteCurrencyAmount: 100,
      currency: { code: "usd" },
    };

    expect(resolveWalletTransactionTitle(transaction, 0)).toBe("100 USD");
  });

  it("resolveWalletTransactionTitle falls back to raw amount", () => {
    const transaction: WalletTransactionItem = {
      amount: "0.5",
    };

    expect(resolveWalletTransactionTitle(transaction, 0)).toBe("0.5");
  });

  it("resolveWalletTransactionTitle falls back to generated title", () => {
    expect(resolveWalletTransactionTitle({}, 2)).toBe("Transaction #3");
  });

  it("resolveWalletTransactionStatus prioritizes status over state", () => {
    expect(resolveWalletTransactionStatus({ status: "done", state: "pending" })).toBe("done");
    expect(resolveWalletTransactionStatus({ state: "pending" })).toBe("pending");
    expect(resolveWalletTransactionStatus({})).toBe("Unknown");
  });

  it("resolveWalletTransactionKey derives stable fallback key", () => {
    expect(resolveWalletTransactionKey({ id: "1", status: "done" }, 0)).toBe("1");
    expect(resolveWalletTransactionKey({ transactionId: "tx-2", status: "done" }, 0)).toBe("tx-2");
    expect(resolveWalletTransactionKey({ status: "pending" }, 5)).toBe("pending-5");
  });
});
