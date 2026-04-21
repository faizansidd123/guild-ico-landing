import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { siteConfig } from "@/config/site";

const mockTransactionsState = {
  data: {
    items: [
      {
        id: "tx-1",
        walletAddress: "0xb2f8dd8b135a10d258ad169d65fe5b69a3cb0c5b",
        txHash: "0x7d835423daab50822b17c03e0967e5e1dc9b446caa5db839ac3cda1995e31897",
        chain: "",
        paymentMethod: "USDC",
        amountIn: 1.008357,
        amountEthEquivalent: 0.05,
        tokenAmount: 5.45,
        usdValue: 0,
        status: "pending" as const,
        createdAt: "2026-04-20T11:58:23.822Z",
        icoName: "$GILD",
        currency: "USDC",
        transactionType: "PURCHASE",
        amountRaw: 1.008357,
      },
      {
        id: "tx-2",
        walletAddress: "0xb2f8dd8b135a10d258ad169d65fe5b69a3cb0c5b",
        txHash: "0x9ea4f3acaee56e2006b87acb8c808e68298bb3fc2eed4925cedbb1c6ed50d4c9",
        chain: "",
        paymentMethod: "ETH" as const,
        amountIn: 0,
        amountEthEquivalent: 0,
        tokenAmount: 5.45,
        usdValue: 0,
        status: "confirmed" as const,
        createdAt: "2026-04-20T11:56:48.037Z",
        icoName: "$GILD",
        currency: "",
        transactionType: "CLAIMED",
        amountRaw: null,
      },
    ],
    total: 2,
    totalPages: 1,
    page: 1,
    pageSize: 15,
  },
  error: null,
  isLoading: false,
  isFetching: false,
};

vi.mock("@/hooks/use-user-transactions", () => ({
  useUserTransactions: () => mockTransactionsState,
}));

import TransactionsSection from "@/components/TransactionsSection";

describe("TransactionsSection", () => {
  it("renders api-shaped transaction rows without appended demo data when api items exist", () => {
    render(<TransactionsSection />);

    expect(screen.getByText("Live Transactions")).toBeInTheDocument();
    expect(screen.getByText("Created At")).toBeInTheDocument();
    expect(screen.getByText("Wallet Address")).toBeInTheDocument();
    expect(screen.getByText("ICO")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getAllByText("$GILD")).toHaveLength(2);
    expect(screen.getByText("PURCHASE")).toBeInTheDocument();
    expect(screen.getByText("CLAIMED")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("1.008357")).toBeInTheDocument();
    expect(screen.getAllByText("5.45")).toHaveLength(2);
    expect(screen.getAllByText("0xb...c5b")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "0x7d835423daab50822b17c03e0967e5e1dc9b446caa5db839ac3cda1995e31897" })).toHaveAttribute(
      "href",
      `${siteConfig.explorers.baseSepoliaTx}0x7d835423daab50822b17c03e0967e5e1dc9b446caa5db839ac3cda1995e31897`,
    );
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Rows:")).not.toBeInTheDocument();
  });
});
