import { isNonEmptyString } from "@/lib/type-guards";

export type EnvKey = keyof ImportMetaEnv;

const envReadCache = new Map<string, string>();
const envOverrides = new Map<string, string | undefined>();

const readExplicitEnvValue = (key: EnvKey): string | undefined => {
  switch (key) {
    case "VITE_WALLET_TOKEN_ADDRESS":
      return import.meta.env.VITE_WALLET_TOKEN_ADDRESS;
    case "NEXT_PUBLIC_WALLET_TOKEN_ADDRESS":
      return import.meta.env.NEXT_PUBLIC_WALLET_TOKEN_ADDRESS;
    case "VITE_WALLET_TOKEN_IMAGE_URL":
      return import.meta.env.VITE_WALLET_TOKEN_IMAGE_URL;
    case "NEXT_PUBLIC_WALLET_TOKEN_IMAGE_URL":
      return import.meta.env.NEXT_PUBLIC_WALLET_TOKEN_IMAGE_URL;
    case "VITE_TOKEN_CONTRACT_CHAIN":
      return import.meta.env.VITE_TOKEN_CONTRACT_CHAIN;
    case "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN":
      return import.meta.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN;
    case "VITE_MOONPAY_API_KEY":
      return import.meta.env.VITE_MOONPAY_API_KEY;
    case "NEXT_PUBLIC_MOONPAY_API_KEY":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_API_KEY;
    case "VITE_MOONPAY_SIGN_URL":
      return import.meta.env.VITE_MOONPAY_SIGN_URL;
    case "NEXT_PUBLIC_MOONPAY_SIGN_URL":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_SIGN_URL;
    case "VITE_MOONPAY_SIGN_BEARER_TOKEN":
      return import.meta.env.VITE_MOONPAY_SIGN_BEARER_TOKEN;
    case "NEXT_PUBLIC_MOONPAY_SIGN_BEARER_TOKEN":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_SIGN_BEARER_TOKEN;
    case "VITE_MOONPAY_SIGNING_AUTH_TOKEN":
      return import.meta.env.VITE_MOONPAY_SIGNING_AUTH_TOKEN;
    case "NEXT_PUBLIC_MOONPAY_SIGNING_AUTH_TOKEN":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_SIGNING_AUTH_TOKEN;
    case "VITE_MOONPAY_WALLET_ADDRESS":
      return import.meta.env.VITE_MOONPAY_WALLET_ADDRESS;
    case "NEXT_PUBLIC_MOONPAY_WALLET_ADDRESS":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_WALLET_ADDRESS;
    case "VITE_MOONPAY_EMAIL":
      return import.meta.env.VITE_MOONPAY_EMAIL;
    case "NEXT_PUBLIC_MOONPAY_EMAIL":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_EMAIL;
    case "VITE_MOONPAY_EXTERNAL_CUSTOMER_ID":
      return import.meta.env.VITE_MOONPAY_EXTERNAL_CUSTOMER_ID;
    case "NEXT_PUBLIC_MOONPAY_EXTERNAL_CUSTOMER_ID":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_EXTERNAL_CUSTOMER_ID;
    case "VITE_MOONPAY_REDIRECT_URL":
      return import.meta.env.VITE_MOONPAY_REDIRECT_URL;
    case "NEXT_PUBLIC_MOONPAY_REDIRECT_URL":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_REDIRECT_URL;
    case "VITE_MOONPAY_CURRENCY_CODE":
      return import.meta.env.VITE_MOONPAY_CURRENCY_CODE;
    case "NEXT_PUBLIC_MOONPAY_CURRENCY_CODE":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_CURRENCY_CODE;
    case "VITE_MOONPAY_BASE_CURRENCY_CODE":
      return import.meta.env.VITE_MOONPAY_BASE_CURRENCY_CODE;
    case "NEXT_PUBLIC_MOONPAY_BASE_CURRENCY_CODE":
      return import.meta.env.NEXT_PUBLIC_MOONPAY_BASE_CURRENCY_CODE;
    case "VITE_ALCHEMY_API_KEY":
      return import.meta.env.VITE_ALCHEMY_API_KEY;
    case "NEXT_PUBLIC_ALCHEMY_API_KEY":
      return import.meta.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    case "VITE_ALCHEMY_POLICY_ID":
      return import.meta.env.VITE_ALCHEMY_POLICY_ID;
    case "NEXT_PUBLIC_ALCHEMY_POLICY_ID":
      return import.meta.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
    case "VITE_WALLETCONNECT_PROJECT_ID":
      return import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    case "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID":
      return import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    case "VITE_ETH_MAINNET_CHAIN_ID":
      return import.meta.env.VITE_ETH_MAINNET_CHAIN_ID;
    case "NEXT_PUBLIC_ETH_MAINNET_CHAIN_ID":
      return import.meta.env.NEXT_PUBLIC_ETH_MAINNET_CHAIN_ID;
    case "VITE_ETH_SEPOLIA_CHAIN_ID":
      return import.meta.env.VITE_ETH_SEPOLIA_CHAIN_ID;
    case "NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_ID":
      return import.meta.env.NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_ID;
    case "VITE_BASE_CHAIN_ID":
      return import.meta.env.VITE_BASE_CHAIN_ID;
    case "NEXT_PUBLIC_BASE_CHAIN_ID":
      return import.meta.env.NEXT_PUBLIC_BASE_CHAIN_ID;
    case "VITE_BASE_SEPOLIA_CHAIN_ID":
      return import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID;
    case "NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID":
      return import.meta.env.NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID;
    case "NEXT_PUBLIC_BASE_URL":
      return import.meta.env.NEXT_PUBLIC_BASE_URL;
    case "VITE_ALCHEMY_RPC_URL":
      return import.meta.env.VITE_ALCHEMY_RPC_URL;
    case "NEXT_PUBLIC_ALCHEMY_RPC_URL":
      return import.meta.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;
    default:
      return undefined;
  }
};

const readEnvValue = (key: EnvKey): string | undefined => {
  if (envOverrides.has(String(key))) {
    return envOverrides.get(String(key));
  }

  return readExplicitEnvValue(key);
};

export const normalizeEnvValue = (value: string | undefined | null): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
};

const cacheKey = (primaryKey: EnvKey, secondaryKey?: EnvKey) => {
  return secondaryKey ? `${String(primaryKey)}::${String(secondaryKey)}` : String(primaryKey);
};

export const getEnvValue = (primaryKey: EnvKey, secondaryKey?: EnvKey): string => {
  const key = cacheKey(primaryKey, secondaryKey);
  const cached = envReadCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const primaryRaw = readEnvValue(primaryKey);
  if (isNonEmptyString(primaryRaw)) {
    const normalizedPrimary = normalizeEnvValue(primaryRaw);
    envReadCache.set(key, normalizedPrimary);
    return normalizedPrimary;
  }

  if (secondaryKey) {
    const secondaryRaw = readEnvValue(secondaryKey);
    if (isNonEmptyString(secondaryRaw)) {
      const normalizedSecondary = normalizeEnvValue(secondaryRaw);
      envReadCache.set(key, normalizedSecondary);
      return normalizedSecondary;
    }
  }

  envReadCache.set(key, "");
  return "";
};

export const getEnvValueWithFallback = (
  primaryKey: EnvKey,
  secondaryKey: EnvKey | undefined,
  fallback: string,
): string => {
  const value = getEnvValue(primaryKey, secondaryKey);
  return value || fallback;
};

export const parseEnvNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseEnvInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

export const readEnvUrl = (value: string | undefined, fallback: string): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

export const parseChainId = (value: string | undefined, fallback: number): number => {
  return parseEnvInteger(value, fallback);
};

export const clearEnvCache = () => {
  envReadCache.clear();
};

export const setEnvValueForTests = (key: string, value: string | undefined) => {
  if (value === undefined) {
    envOverrides.delete(key);
  } else {
    envOverrides.set(key, value);
  }
  clearEnvCache();
};

export const clearEnvValuesForTests = () => {
  envOverrides.clear();
  clearEnvCache();
};
