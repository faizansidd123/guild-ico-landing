import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AcquireButton from "@/components/ico-terminal/AcquireButton";
import AmountQuotePanel from "@/components/ico-terminal/AmountQuotePanel";
import ClaimActionsPanel from "@/components/ico-terminal/ClaimActionsPanel";
import CountdownDisplay from "@/components/ico-terminal/CountdownDisplay";
import DiscountTickerCard from "@/components/ico-terminal/DiscountTickerCard";
import PaymentMethodTabs from "@/components/ico-terminal/PaymentMethodTabs";
import RiskConsentPanel from "@/components/ico-terminal/RiskConsentPanel";
import SaleProgress from "@/components/ico-terminal/SaleProgress";
import SaleStatsGrid from "@/components/ico-terminal/SaleStatsGrid";
import TerminalHeader from "@/components/ico-terminal/TerminalHeader";
import TerminalMarketMeta from "@/components/ico-terminal/TerminalMarketMeta";
import WalletActionButton from "@/components/ico-terminal/WalletActionButton";
import WalletMeta from "@/components/ico-terminal/WalletMeta";

describe("ico terminal components", () => {
  it("renders terminal header", () => {
    render(<TerminalHeader />);
    expect(screen.getByText(/guild token sale terminal/i)).toBeInTheDocument();
  });

  it("renders market metadata with token price", () => {
    render(<TerminalMarketMeta tokenPriceUsd={0.05} />);
    expect(screen.getByText("TOKEN PRICE")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByText("NETWORK")).toBeInTheDocument();
    expect(screen.getByText("Base")).toBeInTheDocument();
  });

  it("renders discount ticker details", () => {
    render(
      <DiscountTickerCard
        currentDiscountPct={35}
        preIcoAllocationUsd={1700000}
        publicSupplyUsd={7000000}
        countdown={{ d: 1, h: 2, m: 3, s: 4, total: 1000 }}
      />,
    );

    expect(screen.getByText("Pre-ICO Discount")).toBeInTheDocument();
    expect(screen.getByText("35% off")).toBeInTheDocument();
    expect(screen.getByText(/available pre-ICO/i)).toBeInTheDocument();
    expect(screen.getByText(/discount ticker update in/i)).toBeInTheDocument();
  });

  it("changes selected payment method through tabs", () => {
    const onSelect = vi.fn();
    render(
      <PaymentMethodTabs
        paymentMethod="ETH"
        options={["ETH", "USDT", "USDC"]}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "USDT" }));
    expect(onSelect).toHaveBeenCalledWith("USDT");
  });

  it("renders amount panel with receive and quote labels", () => {
    const onTokenChange = vi.fn();
    render(
      <AmountQuotePanel
        paymentMethod="ETH"
        payAmountDisplay="2.5"
        tokenAmountInput="50000"
        tokenSymbol="GILD"
        onTokenAmountInputChange={onTokenChange}
      />,
    );

    expect(screen.getByText("You Pay")).toBeInTheDocument();
    expect(screen.getByText("You Receive")).toBeInTheDocument();
    expect(screen.getByText("GILD")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50000")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("50000"), { target: { value: "60000" } });
    expect(onTokenChange).toHaveBeenCalledWith("60000");
  });

  it("ignores invalid non-numeric amount changes", () => {
    const onTokenChange = vi.fn();
    render(
      <AmountQuotePanel
        paymentMethod="ETH"
        payAmountDisplay="1"
        tokenAmountInput="20000"
        tokenSymbol="GILD"
        onTokenAmountInputChange={onTokenChange}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("20000"), { target: { value: "abc" } });
    expect(onTokenChange).not.toHaveBeenCalled();
  });

  it("renders sale stats grid", () => {
    render(
      <SaleStatsGrid
        totalRaisedUsdt={1.007812}
        totalRaisedUsdc={1.008357}
        totalRaisedEth={0.00000801364763177}
        softCap={500}
        hardCapUsd={7000000}
        soldTokens={12000}
      />,
    );
    expect(screen.getByText("Funds Raised")).toBeInTheDocument();
    expect(screen.getByText("1.007812 USDT")).toBeInTheDocument();
    expect(screen.getByText("1.008357 USDC")).toBeInTheDocument();
    expect(screen.getByText("0.000008 ETH")).toBeInTheDocument();
    expect(screen.getByText("Hard Cap")).toBeInTheDocument();
    expect(screen.getByText("Tokens Sold")).toBeInTheDocument();
    expect(screen.getByText("Soft cap")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders sale progress percent", () => {
    render(<SaleProgress progressPct={42.34} />);
    expect(screen.getByText("42.34% SOLD")).toBeInTheDocument();
  });

  it("renders countdown display labels", () => {
    render(<CountdownDisplay countdown={{ d: 2, h: 12, m: 5, s: 9, total: 1000 }} label="Ends in" />);
    expect(screen.getByText("Ends in")).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Mins")).toBeInTheDocument();
    expect(screen.getByText("Secs")).toBeInTheDocument();
  });

  it("toggles risk consent checkboxes", () => {
    const onRiskChange = vi.fn();
    const onTermsChange = vi.fn();

    render(
      <RiskConsentPanel
        acceptedRisk={false}
        acceptedTerms={false}
        onRiskChange={onRiskChange}
        onTermsChange={onTermsChange}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(onRiskChange).toHaveBeenCalled();
    expect(onTermsChange).toHaveBeenCalled();
  });

  it("handles claim action button clicks", () => {
    const onClaim = vi.fn();
    render(
      <ClaimActionsPanel
        actions={["claimToken", "claimRefund", "claimRefundStable"]}
        claimableAmounts={{
          claimToken: "3 GILD",
          claimRefund: "1 ETH",
          claimRefundStable: "1.00024 USDC • 2.001156 USDT",
        }}
        disabled={false}
        onClaim={onClaim}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /claim \$gild token/i }));
    fireEvent.click(screen.getByRole("button", { name: /claim native refund/i }));
    fireEvent.click(screen.getByRole("button", { name: /claim stable refund/i }));

    expect(onClaim).toHaveBeenCalledTimes(3);
    expect(onClaim).toHaveBeenCalledWith("claimToken");
    expect(onClaim).toHaveBeenCalledWith("claimRefund");
    expect(onClaim).toHaveBeenCalledWith("claimRefundStable");
  });

  it("does not invoke claim callbacks when disabled", () => {
    const onClaim = vi.fn();
    render(
      <ClaimActionsPanel
        actions={["claimToken", "claimRefund", "claimRefundStable"]}
        claimableAmounts={{
          claimToken: "3 GILD",
          claimRefund: "1 ETH",
          claimRefundStable: "1.00024 USDC • 2.001156 USDT",
        }}
        disabled
        onClaim={onClaim}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /claim \$gild token/i }));
    fireEvent.click(screen.getByRole("button", { name: /claim native refund/i }));
    fireEvent.click(screen.getByRole("button", { name: /claim stable refund/i }));
    expect(onClaim).not.toHaveBeenCalled();
  });

  it("renders only requested claim actions", () => {
    const onClaim = vi.fn();
    render(
      <ClaimActionsPanel
        actions={["claimToken"]}
        claimableAmounts={{ claimToken: "3 GILD" }}
        disabled={false}
        onClaim={onClaim}
      />,
    );

    expect(screen.getByRole("button", { name: /claim \$gild token/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim native refund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /claim stable refund/i })).not.toBeInTheDocument();
  });

  it("renders claimable amount text for each action", () => {
    render(
      <ClaimActionsPanel
        actions={["claimToken", "claimRefund", "claimRefundStable"]}
        claimableAmounts={{
          claimToken: "3 GILD",
          claimRefund: "1 ETH",
          claimRefundStable: "1.00024 USDC • 2.001156 USDT",
        }}
        disabled={false}
        onClaim={vi.fn()}
      />,
    );

    expect(screen.getByText("Claimable: 3 GILD")).toBeInTheDocument();
    expect(screen.getByText("Claimable: 1 ETH")).toBeInTheDocument();
    expect(screen.getByText("Claimable: 1.00024 USDC • 2.001156 USDT")).toBeInTheDocument();
  });

  it("renders wallet meta errors", () => {
    render(
      <WalletMeta
        globalError="Global error text"
        inputError="Input error text"
      />,
    );

    expect(screen.getByText(/global error text/i)).toBeInTheDocument();
    expect(screen.getByText(/input error text/i)).toBeInTheDocument();
  });

  it("renders nothing when wallet meta has no errors", () => {
    const { container } = render(<WalletMeta globalError="" inputError="" />);

    expect(container.textContent).toBe("");
  });

  it("renders wallet action button and invokes callback", () => {
    const onClick = vi.fn();
    render(<WalletActionButton label="ADD $GILD TO WALLET" onClick={onClick} disabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: /add \$gild to wallet/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not invoke wallet action callback when disabled", () => {
    const onClick = vi.fn();
    render(<WalletActionButton label="ADD $GILD TO WALLET" onClick={onClick} disabled />);

    fireEvent.click(screen.getByRole("button", { name: /add \$gild to wallet/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("invokes acquire button callback when enabled", () => {
    const onClick = vi.fn();
    render(<AcquireButton ctaLabel="ACQUIRE" onClick={onClick} disabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: "ACQUIRE" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not invoke acquire callback when disabled", () => {
    const onClick = vi.fn();
    render(<AcquireButton ctaLabel="ACQUIRE" onClick={onClick} disabled />);

    fireEvent.click(screen.getByRole("button", { name: "ACQUIRE" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
