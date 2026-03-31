import { describe, expect, it } from "vitest";

import {
  getContributionLabel,
  getExplorerLink,
  getTransactionDateLabel,
  getTransactionHashLabel,
  getTransactionStatusVariant,
  getWalletLabel,
} from "@/lib/transactions-view";
import type { UserTransaction } from "@/types/ico";

const baseTransaction: UserTransaction = {
  id: "tx-1",
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  txHash: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  chain: "Ethereum",
  paymentMethod: "ETH",
  amountIn: 1,
  amountEthEquivalent: 1,
  tokenAmount: 20000,
  usdValue: 1000,
  status: "confirmed",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("transactions-view", () => {
  it("builds explorer links for ethereum transactions", () => {
    const url = getExplorerLink(baseTransaction);
    expect(url).toContain("etherscan.io/tx/");
    expect(url).toContain(baseTransaction.txHash);
  });

  it("builds explorer links for base transactions", () => {
    const url = getExplorerLink({
      ...baseTransaction,
      chain: "Base Mainnet",
    });

    expect(url).toContain("basescan.org/tx/");
  });

  it("returns empty explorer link for non-hex tx hash", () => {
    const url = getExplorerLink({
      ...baseTransaction,
      txHash: "hash-not-hex",
    });

    expect(url).toBe("");
  });

  it("maps status variants correctly", () => {
    expect(getTransactionStatusVariant("confirmed")).toBe("default");
    expect(getTransactionStatusVariant("pending")).toBe("secondary");
    expect(getTransactionStatusVariant("failed")).toBe("destructive");
  });

  it("formats contribution label for ETH", () => {
    const label = getContributionLabel(baseTransaction);
    expect(label).toContain("ETH");
    expect(label).toContain("1.0000");
  });

  it("formats contribution label for stablecoins", () => {
    const label = getContributionLabel({
      ...baseTransaction,
      paymentMethod: "USDC",
      amountIn: 1234.56,
    });

    expect(label).toContain("USDC");
    expect(label).toContain("1");
  });

  it("shortens tx hash labels for hex hashes", () => {
    const label = getTransactionHashLabel(baseTransaction);

    expect(label).toContain("...");
    expect(label.length).toBeLessThan(baseTransaction.txHash.length);
  });

  it("keeps tx hash labels as-is for non-hex hashes", () => {
    const label = getTransactionHashLabel({
      ...baseTransaction,
      txHash: "manual-hash",
    });

    expect(label).toBe("manual-hash");
  });

  it("shortens wallet labels for hex addresses", () => {
    const label = getWalletLabel(baseTransaction.walletAddress);
    expect(label).toContain("...");
    expect(label.length).toBeLessThan(baseTransaction.walletAddress.length);
  });

  it("keeps wallet labels as-is for non-hex addresses", () => {
    expect(getWalletLabel("legacy_wallet")).toBe("legacy_wallet");
  });

  it("formats transaction date labels", () => {
    const label = getTransactionDateLabel(baseTransaction.createdAt);
    expect(label.length).toBeGreaterThan(5);
  });
});
