import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import AcquireButton from "@/components/ico-terminal/AcquireButton";
import AmountQuotePanel from "@/components/ico-terminal/AmountQuotePanel";
import ClaimActionsPanel from "@/components/ico-terminal/ClaimActionsPanel";
import CountdownDisplay from "@/components/ico-terminal/CountdownDisplay";
import PaymentMethodTabs from "@/components/ico-terminal/PaymentMethodTabs";
import SaleProgress from "@/components/ico-terminal/SaleProgress";
import SaleStatsGrid from "@/components/ico-terminal/SaleStatsGrid";
import TerminalHeader from "@/components/ico-terminal/TerminalHeader";
import TerminalMarketMeta from "@/components/ico-terminal/TerminalMarketMeta";
import WalletActionButton from "@/components/ico-terminal/WalletActionButton";
import type { ClaimAction } from "@/components/ico-terminal/types";
import WalletMeta from "@/components/ico-terminal/WalletMeta";
import { appText } from "@/content/app-text";
import { chainById, isAddress, isSaleClosed, saleConfig } from "@/config/sale";
import { useCountdown } from "@/hooks/use-countdown";
import { useConversionQuote } from "@/hooks/use-conversion-quote";
import { useDebouncedNumber } from "@/hooks/use-debounced-number";
import { ICO_DETAILS_QUERY_KEY, useIcoDetails } from "@/hooks/use-ico-details";
import { useIcoActions } from "@/hooks/use-ico-actions";
import { USER_ICO_VALUE_QUERY_KEY, useUserIcoValue } from "@/hooks/use-user-ico-value";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { USER_TRANSACTIONS_QUERY_KEY } from "@/hooks/use-user-transactions";
import { trackEvent } from "@/lib/analytics";
import { getErrorMessage, notifyUnknownError, throwToastedError } from "@/lib/error-feedback";
import { ethAmountFormatter, tokenFormatter } from "@/lib/formatters";
import { getStableAllowance } from "@/lib/ico-contract";
import { resolveMoonPayCurrencyCode, resolveMoonPayTopUpAmount } from "@/lib/moonpay";
import { recordLocalContribution } from "@/lib/sale-data";
import { useMoonPay } from "@/providers/moonpayProvider";
import type { PaymentMethod } from "@/types/ico";
import { toast } from "@/components/ui/use-toast";

type StablePaymentMethod = Extract<PaymentMethod, "USDC" | "USDT">;

const PAYMENT_METHOD_OPTIONS = appText.icoTerminal.paymentMethods;
const formatQuoteInputValue = (value: number) => {
  if (Number.isFinite(value) === false) {
    return "";
  }

  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 5,
  });
};

const claimAmountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const ICOTerminal = () => {
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ETH");
  const [tokenAmountInput, setTokenAmountInput] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [addingToken, setAddingToken] = useState(false);

  const {
    connectedAddress: account,
    chainId,
    balanceEth,
    isConnecting,
    walletError,
    sendGaslessTransaction,
    canAddTokenToWallet,
    addTokenToWallet,
    connectWallet,
    ensureChainMatch,
    expectedChainId,
  } = useWalletAuth();
  const {
    purchaseNative,
    purchaseStableCoin,
    claimToken,
    claimRefund,
    claimRefundStable,
    isPending: isActionPending,
  } = useIcoActions({ sendGaslessTransaction });
  const { data: icoDetails, error: icoDetailsError } = useIcoDetails();
  const { data: userIcoValue } = useUserIcoValue({ walletAddress: account });
  const { openMoonPay } = useMoonPay();

  const normalizedTokenAmount = Number(tokenAmountInput);
  const sourceAmount = Number.isFinite(normalizedTokenAmount) ? normalizedTokenAmount : 0;
  const debouncedAmount = useDebouncedNumber(sourceAmount, 250);

  const { data: conversionQuote, error: conversionError, isFetching: isConversionFetching } = useConversionQuote({
    amount: debouncedAmount,
    paymentMethod,
    amountType: "token",
    enabled: sourceAmount > 0,
  });

  const saleStartsAt = icoDetails?.saleStartsAt || "";
  const saleEndsAt = icoDetails?.saleEndsAt || saleConfig.saleEndsAt;
  const isSaleEndedFromApi =
    icoDetails?.saleStatus.trim().toLowerCase() === "ended" &&
    icoDetails?.isActive === false &&
    icoDetails?.isFinalized === true;
  const hasFutureSaleStart = saleStartsAt.length > 0 && new Date(saleStartsAt).getTime() > Date.now();
  const saleNotStarted = hasFutureSaleStart;
  const countdownTargetIso = hasFutureSaleStart ? saleStartsAt : saleEndsAt;
  const countdownLabel = hasFutureSaleStart
    ? appText.icoTerminal.labels.countdownStartsIn
    : appText.icoTerminal.labels.countdownEndsIn;
  const countdown = useCountdown(countdownTargetIso, 1000);

  const tokenPriceUsd = icoDetails?.tokenPriceUsd ?? null;
  const tokensPerEth = icoDetails?.tokensPerEth ?? null;
  const softCap = icoDetails?.softCap ?? null;
  const hardCapUsd = icoDetails?.hardCapUsd ?? null;
  const soldTokens = icoDetails?.soldTokens ?? null;
  const totalRaisedEth = icoDetails?.totalRaisedEth ?? null;
  const totalRaisedUsdt = icoDetails?.totalRaisedUsdt ?? null;
  const totalRaisedUsdc = icoDetails?.totalRaisedUsdc ?? null;
  const progressPct =
    soldTokens !== null && hardCapUsd !== null && hardCapUsd > 0
      ? Math.max(0, Math.min(100, (soldTokens / hardCapUsd) * 100))
      : null;
  const tokenSymbol = icoDetails?.tokenSymbol || saleConfig.tokenSymbol;
  const tokensPerEthForCalc = tokensPerEth ?? saleConfig.tokensPerEth;
  const isStablePayment = paymentMethod === "USDC" || paymentMethod === "USDT";
  const walletBalanceEth = Number(balanceEth || 0);

  const localTokenAmount = sourceAmount;
  const tokenAmount = conversionQuote?.tokenAmount ?? localTokenAmount;
  const isQuotePending = sourceAmount > 0 && !conversionQuote;
  const payAmountResolved = conversionQuote?.amountIn ?? null;
  const amountEthEquivalent =
    conversionQuote?.amountEthEquivalent ??
    (conversionQuote && paymentMethod !== "ETH" ? tokenAmount / Math.max(tokensPerEthForCalc, 0.000001) : null);
  const hasResolvedQuote = typeof payAmountResolved === "number" && typeof amountEthEquivalent === "number";
  const isAmountDebouncing = sourceAmount > 0 && Math.abs(debouncedAmount - sourceAmount) > 0.0000001;
  const isAmountCalculating = sourceAmount > 0 && (isAmountDebouncing || isQuotePending || (isConversionFetching && !conversionQuote));
  const payAmountDisplay = payAmountResolved === null ? "" : formatQuoteInputValue(payAmountResolved);
  const hasInvalidAmount =
    sourceAmount > 0 && !isQuotePending && (!hasResolvedQuote || payAmountResolved <= 0 || tokenAmount <= 0);
  const hasExceededMaxContribution = hasResolvedQuote && amountEthEquivalent > saleConfig.maxContributionEth;
  const hasInsufficientEthBalance =
    paymentMethod === "ETH" && account.length > 0 && hasResolvedQuote && amountEthEquivalent > walletBalanceEth;

  const saleClosed = isSaleEndedFromApi || isSaleClosed(saleEndsAt);
  const selectedChainId = expectedChainId;
  const moonPayCurrencyCode = resolveMoonPayCurrencyCode(selectedChainId);
  const moonPayTopUpAmount = useMemo(
    () =>
      resolveMoonPayTopUpAmount({
        requiredAmount: amountEthEquivalent ?? 0,
        currentBalance: walletBalanceEth,
      }),
    [amountEthEquivalent, walletBalanceEth],
  );

  useEffect(() => {
    let cancelled = false;

    if (!account || !isAddress(account)) {
      return;
    }

    if (!isAddress(saleConfig.saleContractAddress)) {
      return;
    }

    if (!window.ethereum) {
      console.warn("[ICO][ALLOWANCE] Wallet provider unavailable for allowance checks.");
      return;
    }

    const provider = window.ethereum;
    const owner = account;
    const spender = saleConfig.saleContractAddress;

    const logAllowance = async (tokenLabel: StablePaymentMethod, stableCoin: string) => {
      if (!isAddress(stableCoin)) {
        console.warn(`[ICO][ALLOWANCE] ${tokenLabel} contract address is invalid.`);
        return;
      }

      try {
        const allowanceWei = await getStableAllowance({
          provider,
          stableCoin,
          owner,
          spender,
        });

        if (cancelled) {
          return;
        }

        console.info(`[ICO][ALLOWANCE] ${tokenLabel}`, {
          owner,
          spender,
          stableCoin,
          allowanceWei: allowanceWei.toString(),
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error(`[ICO][ALLOWANCE] Failed to read ${tokenLabel} allowance`, error);
      }
    };

    void Promise.all([
      logAllowance("USDC", saleConfig.usdcContractAddress),
      logAllowance("USDT", saleConfig.usdtContractAddress),
    ]);

    return () => {
      cancelled = true;
    };
  }, [account, chainId]);

  const handleTokenAmountInputChange = (value: string) => {
    setTokenAmountInput(value);
  };

  const inputError = useMemo(() => {
    if (hasInvalidAmount) {
      return appText.icoTerminal.inputErrors.invalidAmount;
    }
    if (hasExceededMaxContribution) {
      return `${appText.icoTerminal.inputErrors.maximumPrefix} ${saleConfig.maxContributionEth} ${appText.icoTerminal.inputErrors.ethEquivalentSuffix}`;
    }
    if (hasInsufficientEthBalance) {
      return appText.icoTerminal.inputErrors.insufficientBalance;
    }
    return "";
  }, [hasExceededMaxContribution, hasInsufficientEthBalance, hasInvalidAmount]);

  const ctaLabel = useMemo(() => {
    if (saleClosed) return appText.icoTerminal.cta.saleClosed;
    if (isConnecting) return appText.icoTerminal.cta.connecting;
    if (isActionPending || processing) return appText.icoTerminal.cta.processing;
    if (account.length === 0) return appText.icoTerminal.cta.connectWallet;
    if (chainId !== selectedChainId) {
      const targetChain = chainById[selectedChainId];
      return `${appText.icoTerminal.cta.switchToPrefix} ${targetChain?.name?.toUpperCase() || appText.icoTerminal.cta.switchToFallback}`;
    }
    if (paymentMethod === "USDC") return appText.icoTerminal.cta.buyWithUsdc;
    if (paymentMethod === "USDT") return appText.icoTerminal.cta.buyWithUsdt;
    return `${appText.icoTerminal.cta.acquirePrefix}${tokenSymbol}`;
  }, [account.length, chainId, isActionPending, isConnecting, paymentMethod, processing, saleClosed, selectedChainId, tokenSymbol]);

  const visibleClaimActions = useMemo<ClaimAction[]>(() => {
    if (!icoDetails || !userIcoValue) return [];

    const status = icoDetails.saleStatus.trim().toLowerCase();
    const result = icoDetails.saleResult.trim().toLowerCase();

    if (icoDetails.isFinalized !== true || status !== "ended" || icoDetails.isActive !== false) {
      return [];
    }

    if (result === "success") {
      return userIcoValue.tokens > 0 ? ["claimToken"] : [];
    }

    if (result === "failed") {
      const actions: ClaimAction[] = [];

      if (userIcoValue.eth > 0) {
        actions.push("claimRefund");
      }
      if (userIcoValue.usdc > 0 || userIcoValue.usdt > 0) {
        actions.push("claimRefundStable");
      }

      return actions;
    }

    return [];
  }, [icoDetails, userIcoValue]);

  const claimableAmounts = useMemo<Partial<Record<ClaimAction, string>>>(() => {
    if (!userIcoValue) {
      return {};
    }

    const amounts: Partial<Record<ClaimAction, string>> = {};

    if (userIcoValue.tokens > 0) {
      amounts.claimToken = `${tokenFormatter.format(userIcoValue.tokens)} ${tokenSymbol}`;
    }

    if (userIcoValue.eth > 0) {
      amounts.claimRefund = `${ethAmountFormatter.format(userIcoValue.eth)} ETH`;
    }

    const stableAmounts = [
      userIcoValue.usdc > 0 ? `${claimAmountFormatter.format(userIcoValue.usdc)} USDC` : null,
      userIcoValue.usdt > 0 ? `${claimAmountFormatter.format(userIcoValue.usdt)} USDT` : null,
    ].filter(Boolean);

    if (stableAmounts.length > 0) {
      amounts.claimRefundStable = stableAmounts.join(" • ");
    }

    return amounts;
  }, [tokenSymbol, userIcoValue]);

  const withWalletReady = async (targetChainId: number) => {
    if (account.length === 0) {
      connectWallet();
      throwToastedError("Please complete wallet connection and retry.", "Wallet connection required");
    }

    if (chainId !== targetChainId) {
      await ensureChainMatch(targetChainId);
      toast({
        title: appText.icoTerminal.toasts.networkSwitchedTitle,
        description: `${appText.icoTerminal.toasts.connectedToPrefix} ${chainById[targetChainId].name}.`,
      });
    }

    return {
      provider: window.ethereum,
      activeAccount: account,
    };
  };

  const handleAcquire = async () => {
    if (saleNotStarted) {
      return;
    }

    if (saleClosed) {
      toast({
        variant: "destructive",
        title: appText.icoTerminal.toasts.saleClosedTitle,
        description: appText.icoTerminal.toasts.saleClosedDescription,
      });
      return;
    }

    if (account.length === 0) {
      connectWallet();
      return;
    }

    if (isQuotePending || payAmountResolved === null || amountEthEquivalent === null) {
      toast({
        variant: "destructive",
        title: appText.icoTerminal.toasts.invalidAmountTitle,
        description: appText.icoTerminal.inputErrors.quotePending,
      });
      return;
    }

    if (inputError) {
      toast({
        variant: "destructive",
        title: appText.icoTerminal.toasts.invalidAmountTitle,
        description: inputError,
      });
      return;
    }

    try {
      setProcessing(true);

      if (isAddress(saleConfig.saleContractAddress) === false) {
        throwToastedError(appText.icoTerminal.throwMessages.saleContractMissing, appText.icoTerminal.toasts.purchaseFailedTitle);
      }

      const { provider, activeAccount } = await withWalletReady(selectedChainId);
      console.info("[ICO][PURCHASE] Attempt", {
        chainId,
        targetChainId: selectedChainId,
        paymentMethod,
        account: activeAccount,
        saleContractAddress: saleConfig.saleContractAddress,
        tokenAmountInput,
        payAmountResolved,
        tokenAmount,
        amountEthEquivalent,
      });

      trackEvent("purchase_started", {
        method: paymentMethod,
        amountIn: payAmountResolved,
        amountEthEquivalent,
      });

      if (isStablePayment) {
        const stableCoinAddress = paymentMethod === "USDC" ? saleConfig.usdcContractAddress : saleConfig.usdtContractAddress;

        if (isAddress(stableCoinAddress) === false) {
          throwToastedError(
            paymentMethod === "USDC"
              ? appText.icoTerminal.throwMessages.usdcContractMissing
              : appText.icoTerminal.throwMessages.usdtContractMissing,
            appText.icoTerminal.toasts.purchaseFailedTitle,
          );
        }

        const stablePurchaseArgs = {
          provider,
          saleContractAddress: saleConfig.saleContractAddress,
          stableCoin: stableCoinAddress,
          account: activeAccount,
          tokenAmount,
        };
        console.info("[ICO][PURCHASE] purchaseStableCoin args", {
          chainId,
          targetChainId: selectedChainId,
          ...stablePurchaseArgs,
        });

        const { transactionHash } = await purchaseStableCoin(stablePurchaseArgs);

        recordLocalContribution(amountEthEquivalent, tokenAmount);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ICO_DETAILS_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: USER_TRANSACTIONS_QUERY_KEY }),
        ]);

        trackEvent("purchase_completed", {
          method: paymentMethod,
          amountIn: payAmountResolved,
          amountEthEquivalent,
          txHash: transactionHash,
          stableCoin: paymentMethod,
        });
        toast({
          title:
            paymentMethod === "USDC"
              ? appText.icoTerminal.toasts.usdcPurchaseSubmittedTitle
              : appText.icoTerminal.toasts.usdtPurchaseSubmittedTitle,
          description: `${appText.icoTerminal.toasts.txHashPrefix} ${transactionHash.slice(0, 12)}...`,
        });
        return;
      }

      const nativePurchaseArgs = {
        provider,
        saleContractAddress: saleConfig.saleContractAddress,
        account: activeAccount,
        tokenAmount,
      };
      console.info("[ICO][PURCHASE] purchaseNative args", {
        chainId,
        targetChainId: selectedChainId,
        ...nativePurchaseArgs,
      });

      const { transactionHash } = await purchaseNative(nativePurchaseArgs);

      recordLocalContribution(amountEthEquivalent, tokenAmount);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ICO_DETAILS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: USER_TRANSACTIONS_QUERY_KEY }),
      ]);

      trackEvent("purchase_completed", {
        method: paymentMethod,
        amountIn: payAmountResolved,
        amountEthEquivalent,
        txHash: transactionHash,
      });

      toast({
        title: appText.icoTerminal.toasts.transactionSubmittedTitle,
        description: `${appText.icoTerminal.toasts.txHashPrefix} ${transactionHash.slice(0, 12)}...`,
      });
    } catch (error) {
      const failureMessage = getErrorMessage(error, appText.icoTerminal.toasts.retryFallback);
      if (paymentMethod === "USDT") {
        console.error("[ICO][USDT] Buy failed:", failureMessage, error);
      } else {
        console.error("[ICO] Buy failed:", paymentMethod, failureMessage, error);
      }
      notifyUnknownError(error, appText.icoTerminal.toasts.retryFallback, appText.icoTerminal.toasts.purchaseFailedTitle);
    } finally {
      setProcessing(false);
    }
  };

  const handleMoonPayTopUp = () => {
    if (account.length === 0) {
      connectWallet();
      return;
    }

    if (!moonPayTopUpAmount) {
      return;
    }

    try {
      trackEvent("moonpay_topup_started", {
        paymentMethod,
        amountEthEquivalent,
        currentBalanceEth: walletBalanceEth,
        moonPayAmount: Number(moonPayTopUpAmount),
      });
      openMoonPay({
        currencyCode: moonPayCurrencyCode,
        quoteCurrencyAmount: moonPayTopUpAmount,
        walletAddress: account,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Buy flow unavailable",
        description: getErrorMessage(error, "Could not open MoonPay."),
      });
    }
  };

  const handleClaim = async (action: ClaimAction) => {
    if (account.length === 0) {
      connectWallet();
      return;
    }

    try {
      setProcessing(true);

      if (isAddress(saleConfig.saleContractAddress) === false) {
        throwToastedError(appText.icoTerminal.throwMessages.saleContractMissing, appText.icoTerminal.toasts.claimFailedTitle);
      }

      await withWalletReady(selectedChainId);
      let txHash = "";
      let stableCoinType: StablePaymentMethod | null = null;

      if (action === "claimToken") {
        const { transactionHash } = await claimToken({
          saleContractAddress: saleConfig.saleContractAddress,
        });
        txHash = transactionHash;
      } else if (action === "claimRefund") {
        const { transactionHash } = await claimRefund({
          saleContractAddress: saleConfig.saleContractAddress,
        });
        txHash = transactionHash;
      } else {
        const preferredStableCoinType: StablePaymentMethod | null =
          paymentMethod === "USDC" || paymentMethod === "USDT"
            ? paymentMethod
            : userIcoValue?.usdc > 0 && userIcoValue?.usdt <= 0
              ? "USDC"
              : userIcoValue?.usdt > 0 && userIcoValue?.usdc <= 0
                ? "USDT"
                : null;

        if (!preferredStableCoinType) {
          toast({
            variant: "destructive",
            title: appText.icoTerminal.toasts.selectStableCoinTitle,
            description: appText.icoTerminal.toasts.selectStableCoinDescription,
          });
          return;
        }

        const stableCoinAddress =
          preferredStableCoinType === "USDC" ? saleConfig.usdcContractAddress : saleConfig.usdtContractAddress;

        if (isAddress(stableCoinAddress) === false) {
          throwToastedError(
            preferredStableCoinType === "USDC"
              ? appText.icoTerminal.throwMessages.usdcContractMissing
              : appText.icoTerminal.throwMessages.usdtContractMissing,
            appText.icoTerminal.toasts.claimFailedTitle,
          );
        }

        const { transactionHash } = await claimRefundStable({
          saleContractAddress: saleConfig.saleContractAddress,
          stableCoin: stableCoinAddress,
        });
        txHash = transactionHash;
        stableCoinType = preferredStableCoinType;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ICO_DETAILS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: USER_ICO_VALUE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: USER_TRANSACTIONS_QUERY_KEY }),
      ]);

      trackEvent("claim_submitted", {
        action,
        txHash,
        ...(stableCoinType ? { stableCoin: stableCoinType } : {}),
      });
      toast({
        title:
          action === "claimToken"
            ? appText.icoTerminal.toasts.claimSubmittedTitles.claimToken
            : action === "claimRefund"
              ? appText.icoTerminal.toasts.claimSubmittedTitles.claimRefund
              : appText.icoTerminal.toasts.claimSubmittedTitles.claimRefundStable,
        description: `${appText.icoTerminal.toasts.txHashPrefix} ${txHash.slice(0, 12)}...`,
      });
    } catch (error) {
      notifyUnknownError(error, appText.icoTerminal.toasts.retryFallback, appText.icoTerminal.toasts.claimFailedTitle);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToken = async () => {
    if (account.length === 0) {
      connectWallet();
      return;
    }

    try {
      setAddingToken(true);
      await addTokenToWallet();
      toast({
        title: `${tokenSymbol} added to wallet`,
        description: "Your external wallet can now track this asset.",
      });
    } catch (error) {
      notifyUnknownError(error, `Unable to add ${tokenSymbol} to your wallet.`, "Add token failed");
    } finally {
      setAddingToken(false);
    }
  };

  const globalError =
    icoDetailsError instanceof Error
      ? icoDetailsError.message
      : conversionError instanceof Error
        ? conversionError.message
        : walletError;

  const acquireDisabled =
    processing || isConnecting || isActionPending || !countdown || countdown.total === 0 || isQuotePending;
  const claimDisabled = processing || isConnecting || isActionPending;
  const addTokenDisabled = addingToken || processing || isConnecting || isActionPending;
  const moonPayDisabled = processing || isConnecting || isActionPending;
  const showAddTokenButton = canAddTokenToWallet;
  const showMoonPayTopUpButton =
    !saleClosed &&
    !isQuotePending &&
    account.length > 0 &&
    !hasInvalidAmount &&
    !hasExceededMaxContribution &&
    hasInsufficientEthBalance &&
    !!moonPayTopUpAmount;
  const moonPayLabel = `TOP UP ${moonPayTopUpAmount} ETH WITH MOONPAY`;

  return (
    <motion.div
      id="token-sale"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
      className="glass-surface rounded-2xl p-4 lg:p-5 flex flex-col gap-2.5 max-w-sm w-full mx-auto"
    >
      <TerminalHeader />
      <TerminalMarketMeta tokenPriceUsd={tokenPriceUsd} section="tokenPrice" />

      <SaleStatsGrid
        totalRaisedUsdt={totalRaisedUsdt}
        totalRaisedUsdc={totalRaisedUsdc}
        totalRaisedEth={totalRaisedEth}
        softCap={softCap}
        hardCapUsd={hardCapUsd}
        soldTokens={soldTokens}
      />

      <SaleProgress progressPct={progressPct} />

      {isSaleEndedFromApi ? (
        <div className="space-y-1.5">
          <p className="text-center text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
            {appText.icoTerminal.labels.saleStatus}
          </p>
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-3 text-center">
            <p className="font-mono text-sm uppercase tracking-wide text-primary">
              {appText.icoTerminal.labels.saleEnded}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {appText.icoTerminal.labels.saleEndedDescription}
            </p>
          </div>
        </div>
      ) : countdown ? (
        <CountdownDisplay countdown={countdown} label={countdownLabel} />
      ) : null}

      <TerminalMarketMeta tokenPriceUsd={tokenPriceUsd} section="network" />

      <PaymentMethodTabs
        paymentMethod={paymentMethod}
        options={PAYMENT_METHOD_OPTIONS}
        onSelect={(method) => setPaymentMethod(method)}
      />

      <AmountQuotePanel
        paymentMethod={paymentMethod}
        payAmountDisplay={payAmountDisplay}
        tokenAmountInput={tokenAmountInput}
        isCalculating={isAmountCalculating}
        tokenSymbol={tokenSymbol}
        onTokenAmountInputChange={handleTokenAmountInputChange}
      />

      <AcquireButton ctaLabel={ctaLabel} onClick={() => void handleAcquire()} disabled={acquireDisabled} />

      {showMoonPayTopUpButton ? (
        <WalletActionButton label={moonPayLabel} onClick={handleMoonPayTopUp} disabled={moonPayDisabled} />
      ) : null}

      <WalletMeta
        globalError={globalError}
        inputError={inputError}
      />

      {showAddTokenButton ? (
        <WalletActionButton
          label={`ADD ${tokenSymbol} TO WALLET`}
          onClick={() => void handleAddToken()}
          disabled={addTokenDisabled}
        />
      ) : null}
      
      {visibleClaimActions.length > 0 ? (
        <ClaimActionsPanel
          actions={visibleClaimActions}
          claimableAmounts={claimableAmounts}
          disabled={claimDisabled}
          onClaim={(action) => void handleClaim(action)}
        />
      ) : null}
    </motion.div>
  );
};

export default ICOTerminal;
