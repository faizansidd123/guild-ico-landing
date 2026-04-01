export type PaymentMethod = "ETH" | "USDT" | "USDC";

export type IcoDetails = {
  tokenName: string;
  tokenSymbol: string;
  tokenPriceUsd: number;
  tokensPerEth: number;
  raisedUsd: number;
  hardCapUsd: number;
  softCap?: number;
  soldTokens: number;
  remainingTokens: number;
  progressPct: number;
  saleStartsAt: string;
  saleEndsAt: string;
  minContributionEth: number;
  maxContributionEth: number;
  saleStatus: string;
  saleResult: string;
  isActive: boolean;
  isFinalized: boolean;
  totalRaisedEth: number;
  totalRaisedUsdt: number;
  totalRaisedUsdc: number;
};

export type UserIcoValue = {
  buyer: string;
  tokens: number;
  eth: number;
  usdc: number;
  usdt: number;
};

export type ConversionQuote = {
  paymentMethod: PaymentMethod;
  amountIn: number;
  amountEthEquivalent: number;
  tokenAmount: number;
  tokenPriceUsd: number;
  tokensPerEth: number;
  usdValue: number;
  tokenSymbol: string;
};

export type UserTransactionStatus = "pending" | "confirmed" | "failed";

export type UserTransaction = {
  id: string;
  walletAddress: string;
  txHash: string;
  chain: string;
  paymentMethod: PaymentMethod;
  amountIn: number;
  amountEthEquivalent: number;
  tokenAmount: number;
  usdValue: number;
  status: UserTransactionStatus;
  createdAt: string;
};

export type PaginatedTransactions = {
  items: UserTransaction[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
