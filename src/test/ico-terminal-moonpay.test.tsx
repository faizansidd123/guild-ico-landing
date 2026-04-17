import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  openMoonPay: vi.fn(),
  trackEvent: vi.fn(),
  connectWallet: vi.fn(),
  purchaseNative: vi.fn(),
  purchaseStableCoin: vi.fn(),
  claimToken: vi.fn(),
  claimRefund: vi.fn(),
  claimRefundStable: vi.fn(),
  walletAuth: {
    connectedAddress: "0x1111111111111111111111111111111111111111",
    chainId: 8453,
    balanceEth: "0.5",
    isConnecting: false,
    walletError: "",
    sendGaslessTransaction: vi.fn(),
    canAddTokenToWallet: false,
    addTokenToWallet: vi.fn(),
    connectWallet: vi.fn(),
    ensureChainMatch: vi.fn(),
    expectedChainId: 8453,
  },
  icoDetails: {
    tokenName: "Guild Token",
    tokenSymbol: "GILD",
    tokenPriceUsd: 0.05,
    tokensPerEth: 20000,
    hardCapUsd: 7000000,
    raisedUsd: 100000,
    soldTokens: 1000,
    remainingTokens: 1000000,
    progressPct: 10,
    saleStartsAt: "",
    saleEndsAt: "2026-12-31T23:59:59.000Z",
    minContributionEth: 0,
    maxContributionEth: 100,
    saleStatus: "active",
    saleResult: "",
    isActive: true,
    isFinalized: false,
    totalRaisedEth: 0,
    totalRaisedUsdt: 0,
    totalRaisedUsdc: 0,
  },
  userIcoValue: {
    buyer: "0x1111111111111111111111111111111111111111",
    tokens: 0,
    eth: 0,
    usdc: 0,
    usdt: 0,
  },
  conversionQuote: {
    data: {
      paymentMethod: "ETH",
      amountIn: 1,
      amountEthEquivalent: 1,
      tokenAmount: 20000,
      tokenPriceUsd: 0.05,
      tokensPerEth: 20000,
      usdValue: 1000,
      tokenSymbol: "GILD",
    },
    error: null,
    isFetching: false,
  },
}));

vi.mock("@/hooks/use-wallet-auth", () => ({
  useWalletAuth: () => ({
    ...mockState.walletAuth,
    connectWallet: mockState.connectWallet,
  }),
}));

vi.mock("@/hooks/use-ico-actions", () => ({
  useIcoActions: () => ({
    purchaseNative: mockState.purchaseNative,
    purchaseStableCoin: mockState.purchaseStableCoin,
    claimToken: mockState.claimToken,
    claimRefund: mockState.claimRefund,
    claimRefundStable: mockState.claimRefundStable,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-ico-details", () => ({
  ICO_DETAILS_QUERY_KEY: ["ico-details"],
  useIcoDetails: () => ({
    data: mockState.icoDetails,
    error: null,
  }),
}));

vi.mock("@/hooks/use-user-ico-value", () => ({
  USER_ICO_VALUE_QUERY_KEY: ["user-ico-value"],
  useUserIcoValue: () => ({
    data: mockState.userIcoValue,
    error: null,
  }),
}));

vi.mock("@/hooks/use-conversion-quote", () => ({
  useConversionQuote: () => mockState.conversionQuote,
}));

vi.mock("@/hooks/use-countdown", () => ({
  useCountdown: () => ({ d: 1, h: 2, m: 3, s: 4, total: 1000 }),
}));

vi.mock("@/hooks/use-debounced-number", () => ({
  useDebouncedNumber: (value: number) => value,
}));

vi.mock("@/providers/moonpayProvider", () => ({
  useMoonPay: () => ({
    openMoonPay: mockState.openMoonPay,
    closeMoonPay: vi.fn(),
  }),
}));

vi.mock("@/lib/analytics", () => ({
  getStoredReferral: () => "",
  trackEvent: mockState.trackEvent,
}));

import ICOTerminal from "@/components/ICOTerminal";

const renderTerminal = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ICOTerminal />
    </QueryClientProvider>,
  );
};

describe("ICOTerminal MoonPay top-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.walletAuth.balanceEth = "0.5";
    mockState.walletAuth.chainId = 8453;
    mockState.walletAuth.expectedChainId = 8453;
    mockState.walletAuth.connectedAddress = "0x1111111111111111111111111111111111111111";
    mockState.conversionQuote.data = {
      paymentMethod: "ETH",
      amountIn: 1,
      amountEthEquivalent: 1,
      tokenAmount: 20000,
      tokenPriceUsd: 0.05,
      tokensPerEth: 20000,
      usdValue: 1000,
      tokenSymbol: "GILD",
    };
    mockState.icoDetails.saleStatus = "active";
    mockState.icoDetails.saleResult = "";
    mockState.icoDetails.isActive = true;
    mockState.icoDetails.isFinalized = false;
    mockState.icoDetails.saleStartsAt = "";
    mockState.icoDetails.totalRaisedEth = 0;
    mockState.icoDetails.totalRaisedUsdt = 0;
    mockState.icoDetails.totalRaisedUsdc = 0;
    mockState.userIcoValue.buyer = "0x1111111111111111111111111111111111111111";
    mockState.userIcoValue.tokens = 0;
    mockState.userIcoValue.eth = 0;
    mockState.userIcoValue.usdc = 0;
    mockState.userIcoValue.usdt = 0;
  });

  it("shows a MoonPay top-up action for insufficient ETH and prefills the shortfall plus 2%", () => {
    renderTerminal();

    const moonPayButton = screen.getByRole("button", { name: /moonpay/i });
    expect(moonPayButton).toHaveTextContent("TOP UP 0.51 ETH WITH MOONPAY");

    fireEvent.click(moonPayButton);

    expect(mockState.openMoonPay).toHaveBeenCalledWith({
      currencyCode: "eth_base",
      quoteCurrencyAmount: "0.51",
      walletAddress: "0x1111111111111111111111111111111111111111",
    });
    expect(mockState.trackEvent).toHaveBeenCalledWith(
      "moonpay_topup_started",
      expect.objectContaining({
        amountEthEquivalent: 1,
        currentBalanceEth: 0.5,
        moonPayAmount: 0.51,
        paymentMethod: "ETH",
      }),
    );
  });

  it("disables acquisition before the ICO start time is reached", () => {
    mockState.icoDetails.saleStartsAt = "2026-12-01T00:00:00.000Z";

    renderTerminal();

    expect(screen.getByText("Starts in")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sale not started/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /moonpay/i })).not.toBeInTheDocument();
  });

  it("hides the MoonPay top-up action when the wallet balance already covers the purchase", () => {
    mockState.walletAuth.balanceEth = "1.5";

    renderTerminal();

    expect(screen.queryByRole("button", { name: /moonpay/i })).not.toBeInTheDocument();
  });

  it("shows the claim token action only after the ICO is finalized with success", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "success";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = true;
    mockState.userIcoValue.tokens = 3;

    renderTerminal();

    expect(screen.getByRole("button", { name: /claim \$gild token/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim native refund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim stable refund/i })).not.toBeInTheDocument();
  });

  it("does not show claim actions before the ICO is finalized", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "success";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = false;

    renderTerminal();

    expect(screen.queryByRole("button", { name: /claim \$gild token/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim native refund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim stable refund/i })).not.toBeInTheDocument();
  });

  it("replaces the countdown with an ended message when the API marks the ICO as ended", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "success";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = true;

    renderTerminal();

    expect(screen.getByText("SALE ENDED")).toBeInTheDocument();
    expect(screen.getByText("This sale phase has ended.")).toBeInTheDocument();
    expect(screen.queryByText("Ends in")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sale closed/i })).toBeDisabled();
  });

  it("does not show the claim token action when the wallet has no claimable tokens", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "success";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = true;
    mockState.userIcoValue.tokens = 0;

    renderTerminal();

    expect(screen.queryByRole("button", { name: /claim \$gild token/i })).not.toBeInTheDocument();
  });

  it("shows refund actions only after the ICO is finalized with failure", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "failed";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = true;
    mockState.userIcoValue.eth = 1;
    mockState.userIcoValue.usdc = 1.00024;

    renderTerminal();

    expect(screen.queryByRole("button", { name: /claim \$gild token/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /claim native refund/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /claim stable refund/i })).toBeInTheDocument();
  });

  it("hides refund actions when the wallet has no refundable balances", () => {
    mockState.icoDetails.saleStatus = "ended";
    mockState.icoDetails.saleResult = "failed";
    mockState.icoDetails.isActive = false;
    mockState.icoDetails.isFinalized = true;
    mockState.userIcoValue.eth = 0;
    mockState.userIcoValue.usdc = 0;
    mockState.userIcoValue.usdt = 0;

    renderTerminal();

    expect(screen.queryByRole("button", { name: /claim native refund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim stable refund/i })).not.toBeInTheDocument();
  });
});
