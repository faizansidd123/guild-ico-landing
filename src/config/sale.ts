import { getEnvValue, parseEnvNumber } from "@/lib/env-utils";

export const chainCatalog = {
  ethereum: {
    id: 1,
    hex: "0x1",
    name: "Ethereum",
    symbol: "ETH",
    rpcUrls: ["https://ethereum-rpc.publicnode.com"],
    explorerUrl: "https://sepolia.basescan.org",
  },
  base: {
    id: 8453,
    hex: "0x2105",
    name: "Base",
    symbol: "ETH",
    rpcUrls: ["https://mainnet.base.org"],
    explorerUrl: "https://basescan.org",
  },
  baseSepolia: {
    id: 84532,
    hex: "0x14a34",
    name: "Base Sepolia",
    symbol: "ETH",
    rpcUrls: ["https://sepolia.base.org"],
    explorerUrl: "https://sepolia.basescan.org",
  },
} as const;

const supportedChains = [chainCatalog.ethereum.id, chainCatalog.base.id, chainCatalog.baseSepolia.id] as const;
const DEFAULT_ICO_CONTRACT_ADDRESS = "0xCc88335320960bBce37bCD5F71C60ecBFd281Bd1";
const DEFAULT_USDC_CONTRACT_ADDRESS = "0x6a387873fb15553C2806599aE344aD09a9Bb59EE";
const DEFAULT_USDT_CONTRACT_ADDRESS = "0x322970ca118ef02f226577e68A279e90a081b555";
const DEFAULT_WALLET_TOKEN_ADDRESS = "0xC106e3Af20B0742f713ef4c28810dF39E23DA070";
const DEFAULT_WALLET_TOKEN_IMAGE_URL = "https://storage.googleapis.com/tenant-branding/Guild_logo.png";

const buildSaleConfig = () => {
  return {
    tokenName: "Guild Token",
    tokenSymbol: "$GILD",
    tokenDecimals: 18,
    tokenPriceUsd: parseEnvNumber(import.meta.env.VITE_TOKEN_PRICE_USD, 0.05),
    tokensPerEth: parseEnvNumber(import.meta.env.VITE_TOKENS_PER_ETH, 20000),
    hardCapUsd: parseEnvNumber(import.meta.env.VITE_HARD_CAP_USD, 7_000_000),
    totalTokensForSale: parseEnvNumber(import.meta.env.VITE_TOTAL_TOKENS_FOR_SALE, 500),
    preIcoAllocationUsd: parseEnvNumber(import.meta.env.VITE_PRE_ICO_ALLOCATION_USD, 1_700_000),
    publicSupplyUsd: parseEnvNumber(import.meta.env.VITE_PUBLIC_SUPPLY_USD, 7_000_000),
    preIcoMaxDiscountPct: parseEnvNumber(import.meta.env.VITE_PRE_ICO_MAX_DISCOUNT_PCT, 50),
    currentDiscountPct: parseEnvNumber(import.meta.env.VITE_CURRENT_DISCOUNT_PCT, 35),
    discountTickerAt: import.meta.env.VITE_DISCOUNT_TICKER_AT || "2026-04-15T00:00:00Z",
    minContributionEth: parseEnvNumber(import.meta.env.VITE_MIN_BUY_ETH, 0),
    maxContributionEth: parseEnvNumber(import.meta.env.VITE_MAX_BUY_ETH, 100),
    saleEndsAt: import.meta.env.VITE_SALE_ENDS_AT || "2026-12-31T23:59:59Z",
    treasuryAddress: import.meta.env.VITE_TREASURY_ADDRESS || "",
    saleContractAddress: import.meta.env.VITE_SALE_CONTRACT_ADDRESS || DEFAULT_ICO_CONTRACT_ADDRESS,
    usdcContractAddress: import.meta.env.VITE_USDC_CONTRACT_ADDRESS || DEFAULT_USDC_CONTRACT_ADDRESS,
    usdtContractAddress: import.meta.env.VITE_USDT_CONTRACT_ADDRESS || DEFAULT_USDT_CONTRACT_ADDRESS,
    walletTokenAddress:
      getEnvValue("VITE_WALLET_TOKEN_ADDRESS", "NEXT_PUBLIC_WALLET_TOKEN_ADDRESS") || DEFAULT_WALLET_TOKEN_ADDRESS,
    walletTokenImageUrl:
      getEnvValue("VITE_WALLET_TOKEN_IMAGE_URL", "NEXT_PUBLIC_WALLET_TOKEN_IMAGE_URL") ||
      DEFAULT_WALLET_TOKEN_IMAGE_URL,
    saleApiUrl: import.meta.env.VITE_SALE_API_URL || "",
    icoDetailsApiUrl: import.meta.env.VITE_ICO_DETAILS_API_URL || "",
    conversionApiUrl: import.meta.env.VITE_CONVERSION_API_URL || "",
    transactionsApiUrl: import.meta.env.VITE_TRANSACTIONS_API_URL || "",
    userValueApiUrl: import.meta.env.VITE_USER_VALUE_API_URL || "",
    waitlistApiUrl: import.meta.env.VITE_WAITLIST_API_URL || "",
    supportedChains,
  };
};

export const saleConfig = Object.freeze(buildSaleConfig());

export type SupportedChainId = (typeof supportedChains)[number];

export const chainById = Object.values(chainCatalog).reduce<Record<number, (typeof chainCatalog)[keyof typeof chainCatalog]>>(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {},
);

export const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export const isSaleClosed = (saleEndIso: string) => Date.now() >= new Date(saleEndIso).getTime();
