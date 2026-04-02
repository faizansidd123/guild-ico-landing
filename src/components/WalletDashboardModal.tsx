import {
  ArrowDownToLine,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { appText } from "@/content/app-text";
import { chainById, saleConfig } from "@/config/sale";
import { getErrorMessage } from "@/lib/error-feedback";
import { formatReadableBalance } from "@/lib/formatters";
import { resolveMoonPayCurrencyCode } from "@/lib/moonpay";
import {
  fetchWalletTokenBalances,
  fetchWalletTransactions,
  type WalletTransactionItem,
} from "@/lib/wallet-dashboard-api";
import {
  resolveWalletTransactionKey,
  resolveWalletTransactionStatus,
  resolveWalletTransactionTitle,
} from "@/lib/wallet-dashboard-normalizers";
import { trackEvent } from "@/lib/analytics";
import { useMoonPay } from "@/providers/moonpayProvider";
import { toast } from "@/components/ui/use-toast";

type WalletModalView = "home" | "send" | "receive" | "transactions" | "assets";

type SendGaslessTransaction = (params: {
  target: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
}) => Promise<string>;

type WalletDashboardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectedAddress: string;
  shortAddress: string;
  chainId: number | null;
  balanceEth: string;
  walletError: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
  sendGaslessTransaction: SendGaslessTransaction;
};

const walletAddressPattern = /^0x[a-fA-F0-9]{40}$/;

const parseWei = (value: string) => {
  try {
    return parseEther(value);
  } catch {
    return 0n;
  }
};

const WalletDashboardModal = ({
  open,
  onOpenChange,
  isConnected,
  isConnecting,
  connectedAddress,
  shortAddress,
  chainId,
  balanceEth,
  walletError,
  connectWallet,
  disconnectWallet,
  sendGaslessTransaction,
}: WalletDashboardModalProps) => {
  const [view, setView] = useState<WalletModalView>("home");
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [usdcBalance, setUsdcBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const hasAddress = connectedAddress.length > 0;
  const network = chainId && chainById[chainId] ? chainById[chainId] : null;
  const networkName = network?.name || "Network";
  const networkSymbol = network?.symbol || "ETH";
  const displayAddress = hasAddress ? connectedAddress : shortAddress;
  const usdcAddress = useMemo(() => saleConfig.usdcContractAddress.toLowerCase(), []);
  const usdtAddress = useMemo(() => saleConfig.usdtContractAddress.toLowerCase(), []);
  const moonPayCurrencyCode = useMemo(() => resolveMoonPayCurrencyCode(chainId), [chainId]);
  const { openMoonPay } = useMoonPay();

  useEffect(() => {
    if (!open) {
      setView("home");
      setSendTo("");
      setSendAmount("");
    }
  }, [open]);

  const notifyConnectRequired = useCallback(() => {
    toast({
      variant: "destructive",
      title: "Wallet connection required",
      description: "Connect wallet first to use this action.",
    });
  }, []);

  const copyAddress = useCallback(async () => {
    if (!hasAddress) {
      notifyConnectRequired();
      return;
    }

    try {
      await navigator.clipboard.writeText(connectedAddress);
      trackEvent("wallet_address_copied", { account: connectedAddress });
      toast({
        title: appText.navbar.wallet.addressCopiedTitle,
        description: connectedAddress,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: appText.navbar.wallet.copyFailedTitle,
        description: getErrorMessage(error, appText.navbar.wallet.copyFailedFallback),
      });
    }
  }, [connectedAddress, hasAddress, notifyConnectRequired]);

  const onConnectDisconnect = useCallback(() => {
    if (hasAddress && isConnected) {
      disconnectWallet();
      trackEvent("wallet_disconnected");
      toast({
        title: "Wallet disconnected",
      });
      return;
    }

    // Close this modal first so the Alchemy auth modal remains fully interactive.
    onOpenChange(false);
    window.setTimeout(() => {
      try {
        connectWallet();
      } catch (error) {
        toast({
          variant: "destructive",
          title: appText.navbar.wallet.connectionFailedTitle,
          description: getErrorMessage(error, walletError || appText.navbar.wallet.retryFallback),
        });
      }
    }, 80);
  }, [connectWallet, disconnectWallet, hasAddress, isConnected, onOpenChange, walletError]);

  const onBuy = useCallback(() => {
    onOpenChange(false);
    window.setTimeout(() => {
      try {
        openMoonPay({
          currencyCode: moonPayCurrencyCode,
          ...(hasAddress ? { walletAddress: connectedAddress } : {}),
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Buy flow unavailable",
          description: getErrorMessage(error, "Could not open MoonPay."),
        });
      }
    }, 80);
  }, [connectedAddress, hasAddress, moonPayCurrencyCode, onOpenChange, openMoonPay]);

  useEffect(() => {
    if (!open || view !== "assets" || !hasAddress) {
      return;
    }

    let cancelled = false;
    setIsLoadingTokens(true);
    setTokenError(null);

    fetchWalletTokenBalances(connectedAddress)
      .then((balances) => {
        if (cancelled) return;
        const usdc = balances.find((item) => (item.contractAddress || "").toLowerCase() === usdcAddress);
        const usdt = balances.find((item) => (item.contractAddress || "").toLowerCase() === usdtAddress);
        setUsdcBalance(usdc?.tokenBalance || "0");
        setUsdtBalance(usdt?.tokenBalance || "0");
      })
      .catch((error) => {
        if (cancelled) return;
        setTokenError(getErrorMessage(error, "Failed to load token balances."));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingTokens(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connectedAddress, hasAddress, open, usdcAddress, usdtAddress, view]);

  useEffect(() => {
    if (!open || view !== "transactions" || !hasAddress) {
      return;
    }

    let cancelled = false;
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    setTransactions([]);

    fetchWalletTransactions(connectedAddress)
      .then((result) => {
        if (cancelled) return;
        setTransactions(result.items);
      })
      .catch((error) => {
        if (cancelled) return;
        setTransactionsError(getErrorMessage(error, "Failed to load transactions."));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingTransactions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connectedAddress, hasAddress, open, view]);

  const submitSend = useCallback(async () => {
    if (!hasAddress || !isConnected) {
      notifyConnectRequired();
      return;
    }

    const recipient = sendTo.trim();
    if (!walletAddressPattern.test(recipient)) {
      toast({
        variant: "destructive",
        title: "Invalid address",
        description: "Enter a valid EVM recipient wallet address.",
      });
      return;
    }

    if (!sendAmount.trim()) {
      toast({
        variant: "destructive",
        title: "Amount required",
        description: "Enter an amount to send.",
      });
      return;
    }

    try {
      const amountWei = parseEther(sendAmount.trim());
      if (amountWei <= 0n) {
        throw new Error("Amount must be greater than 0.");
      }

      const availableWei = parseWei(balanceEth);
      if (amountWei > availableWei) {
        throw new Error("Insufficient wallet balance.");
      }

      setIsSending(true);
      await sendGaslessTransaction({
        target: recipient as `0x${string}`,
        data: "0x",
        value: amountWei,
      });

      toast({
        title: "Transfer sent",
        description: `${sendAmount} ${networkSymbol} sent.`,
      });
      setSendTo("");
      setSendAmount("");
      setView("home");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: getErrorMessage(error, "Could not send transaction."),
      });
    } finally {
      setIsSending(false);
    }
  }, [
    balanceEth,
    hasAddress,
    isConnected,
    networkSymbol,
    notifyConnectRequired,
    sendAmount,
    sendGaslessTransaction,
    sendTo,
  ]);

  const transactionRows = useMemo(
    () =>
      transactions.map((tx, index) => ({
        key: resolveWalletTransactionKey(tx, index),
        title: resolveWalletTransactionTitle(tx, index),
        status: resolveWalletTransactionStatus(tx),
        createdAt: tx.createdAt || "-",
      })),
    [transactions],
  );

  const renderBackButton = () => (
    <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={() => setView("home")}>
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md border border-slate-800 bg-[#0f1115] p-0 text-white">
        <DialogTitle className="sr-only">Wallet</DialogTitle>
        <DialogDescription className="sr-only">Wallet actions and account information.</DialogDescription>

        {view === "home" ? (
          <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-4 px-[0px] py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="break-all pr-2 text-sm font-semibold">{hasAddress ? displayAddress : "Not connected"}</p>
                <p className="text-xs text-slate-400">Guild Wallet</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-300 hover:text-white"
                onClick={() => void copyAddress()}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="outline" className="border-slate-700 bg-[#15171d] text-white hover:bg-slate-800" onClick={() => setView("send")}>
                <ArrowUpRight className="h-4 w-4" />
                Send
              </Button>
              <Button type="button" variant="outline" className="border-slate-700 bg-[#15171d] text-white hover:bg-slate-800" onClick={() => setView("receive")}>
                <ArrowDownToLine className="h-4 w-4" />
                Receive
              </Button>
              <Button type="button" variant="outline" className="border-slate-700 bg-[#15171d] text-white hover:bg-slate-800" onClick={onBuy}>
                <Plus className="h-4 w-4" />
                Buy
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#15171d] px-3 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{networkName}</p>
                <p className="text-xs text-slate-400">
                  {formatReadableBalance(balanceEth, 4)} {networkSymbol}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => setView("transactions")}
              >
                <span>Transactions</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => setView("assets")}
              >
                <span>View Assets</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <Button type="button" className="w-full bg-[#1b6bff] text-white hover:bg-[#1555ca]" onClick={onConnectDisconnect} disabled={isConnecting}>
              {isConnecting ? appText.navbar.wallet.connectingCompact : hasAddress ? appText.navbar.wallet.disconnect : appText.navbar.wallet.connectWallet}
            </Button>
          </div>
        ) : null}

        {view === "send" ? (
          <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-4 px-[10px] py-6">
            <div className="flex items-center justify-between">
              {renderBackButton()}
              <p className="text-sm font-semibold">Send Funds</p>
            </div>

            {!hasAddress ? (
              <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3 text-sm text-slate-300">
                Connect wallet first to send funds.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3">
                  <p className="text-xs text-slate-400">Available Balance</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatReadableBalance(balanceEth, 6)} {networkSymbol}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Send to</p>
                  <Input
                    value={sendTo}
                    onChange={(event) => setSendTo(event.target.value)}
                    placeholder="0x..."
                    className="border-slate-700 bg-[#15171d] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Amount</p>
                  <Input
                    value={sendAmount}
                    onChange={(event) => setSendAmount(event.target.value)}
                    placeholder="0.0"
                    className="border-slate-700 bg-[#15171d] text-white"
                  />
                </div>

                <Button type="button" className="w-full bg-[#1b6bff] text-white hover:bg-[#1555ca]" onClick={() => void submitSend()} disabled={isSending}>
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </>
            )}
          </div>
        ) : null}

        {view === "receive" ? (
          <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-4 px-[10px] py-6">
            <div className="flex items-center justify-between">
              {renderBackButton()}
              <p className="text-sm font-semibold">Receive</p>
            </div>

            {!hasAddress ? (
              <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3 text-sm text-slate-300">
                Connect a wallet to view your receive address.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=0f1115&data=${encodeURIComponent(connectedAddress)}`}
                    alt="Wallet QR"
                    className="h-[200px] w-[200px] rounded"
                  />
                </div>
                <p className="text-xs text-slate-400">Wallet Address</p>
                <div className="flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2">
                  <span className="flex-1 break-all text-xs text-slate-200">{connectedAddress}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-white" onClick={() => void copyAddress()}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {view === "transactions" ? (
          <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-4 px-[10px] py-6">
            <div className="flex items-center justify-between">
              {renderBackButton()}
              <p className="text-sm font-semibold">Transactions</p>
            </div>

            {!hasAddress ? (
              <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3 text-sm text-slate-300">
                Connect wallet to view transactions.
              </div>
            ) : isLoadingTransactions && transactions.length === 0 ? (
              <p className="text-sm text-slate-400">Loading transactions...</p>
            ) : transactionsError ? (
              <p className="text-sm text-red-400">{transactionsError}</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-400">No transactions found.</p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {transactionRows.map((transaction) => {
                    return (
                      <div
                        key={transaction.key}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{transaction.title}</p>
                          <p className="text-xs text-slate-400">{transaction.createdAt}</p>
                        </div>
                        <p className="ml-3 text-xs text-slate-300">{transaction.status}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {view === "assets" ? (
          <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-4 px-[10px] py-6">
            <div className="flex items-center justify-between">
              {renderBackButton()}
              <p className="text-sm font-semibold">View Assets</p>
            </div>

            {!hasAddress ? (
              <div className="rounded-lg border border-slate-800 bg-[#15171d] p-3 text-sm text-slate-300">
                Connect wallet to view assets.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2">
                  <p className="text-sm font-semibold text-white">{networkSymbol}</p>
                  <p className="text-xs text-slate-400">
                    {formatReadableBalance(balanceEth, 6)} {networkSymbol}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2">
                  <p className="text-sm font-semibold text-white">USDC</p>
                  <p className="text-xs text-slate-400">
                    {isLoadingTokens
                      ? "Loading..."
                      : tokenError
                        ? "Error loading token balance"
                        : `${formatReadableBalance(usdcBalance, 6)} USDC`}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#15171d] px-3 py-2">
                  <p className="text-sm font-semibold text-white">USDT</p>
                  <p className="text-xs text-slate-400">
                    {isLoadingTokens
                      ? "Loading..."
                      : tokenError
                        ? "Error loading token balance"
                        : `${formatReadableBalance(usdtBalance, 6)} USDT`}
                  </p>
                </div>
                {tokenError ? <p className="text-xs text-red-400">{tokenError}</p> : null}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default WalletDashboardModal;
