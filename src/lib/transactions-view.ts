import { chainCatalog } from "@/config/sale";
import { formatAddress } from "@/lib/eth";
import { dateTimeFormatter, numberFormatter } from "@/lib/formatters";
import type { UserTransaction } from "@/types/ico";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const getExplorerLink = (transaction: UserTransaction): string => {
  if (!transaction.txHash.startsWith("0x")) {
    return "";
  }

  const base = transaction.chain.toLowerCase().includes("base")
    ? chainCatalog.base.explorerUrl
    : chainCatalog.ethereum.explorerUrl;

  return `${base}/tx/${transaction.txHash}`;
};

export const getTransactionStatusVariant = (status: UserTransaction["status"]): BadgeVariant => {
  if (status === "failed") return "destructive";
  if (status === "pending") return "secondary";
  return "default";
};

export const getContributionLabel = (transaction: UserTransaction): string => {
  if (transaction.paymentMethod === "USDC" || transaction.paymentMethod === "USDT") {
    return `${numberFormatter.format(transaction.amountIn)} ${transaction.paymentMethod}`;
  }

  return `${transaction.amountIn.toFixed(4)} ${transaction.paymentMethod}`;
};

export const getTransactionHashLabel = (transaction: UserTransaction): string => {
  if (transaction.txHash.startsWith("0x")) {
    return `${transaction.txHash.slice(0, 10)}...${transaction.txHash.slice(-6)}`;
  }

  return transaction.txHash;
};

export const getWalletLabel = (walletAddress: string): string => {
  if (walletAddress.startsWith("0x")) {
    return formatAddress(walletAddress, 4);
  }

  return walletAddress;
};

export const getTransactionDateLabel = (dateIso: string): string => {
  return dateTimeFormatter.format(new Date(dateIso));
};
