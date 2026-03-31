export type WalletNftImage = {
  originalUrl?: string;
  pngUrl?: string;
  thumbnailUrl?: string;
};

export type WalletNftMetadata = {
  artwork?: string;
  image?: string;
  title?: string;
};

export type WalletNftItem = {
  tokenId?: string | number;
  name?: string;
  image?: WalletNftImage;
  raw?: {
    metadata?: WalletNftMetadata;
  };
};

export type WalletTokenBalanceItem = {
  contractAddress?: string;
  tokenAddress?: string | null;
  tokenBalance?: string;
  tokenBalanceRaw?: string;
};

export type WalletTransactionCurrency = {
  code?: string;
};

export type WalletTransactionItem = {
  id?: string;
  transactionId?: string;
  baseCurrencyAmount?: string | number;
  baseCurrency?: WalletTransactionCurrency;
  quoteCurrencyAmount?: string | number;
  currency?: WalletTransactionCurrency;
  amount?: string | number;
  status?: string;
  state?: string;
  createdAt?: string;
};

export type WalletTransactionsPage = {
  items: WalletTransactionItem[];
  totalPages: number;
};

export type OwnedNftsApiResponse = {
  data?: {
    ownedNfts?: WalletNftItem[];
  };
  ownedNfts?: WalletNftItem[];
};

export type TokenBalancesApiResponse = {
  data?:
    | {
        tokenBalances?: WalletTokenBalanceItem[];
        tokens?: WalletTokenBalanceItem[];
        data?: WalletTokenBalanceItem[];
        items?: WalletTokenBalanceItem[];
      }
    | WalletTokenBalanceItem[];
  tokenBalances?: WalletTokenBalanceItem[];
  tokens?: WalletTokenBalanceItem[];
  items?: WalletTokenBalanceItem[];
};

export type TransactionsPayload = {
  data?: WalletTransactionItem[];
  pagination?: {
    pages?: number;
    totalPages?: number;
  };
};

export type TransactionsApiResponse = {
  data?: TransactionsPayload | WalletTransactionItem[];
  pagination?: {
    pages?: number;
    totalPages?: number;
  };
  transactions?: WalletTransactionItem[];
};
