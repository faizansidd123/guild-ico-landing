/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { MoonPayBuyWidget, MoonPayProvider as MoonPaySdkProvider } from "@moonpay/moonpay-react";

import { siteConfig } from "@/config/site";
import { getEnvValue, normalizeEnvValue } from "@/lib/env-utils";
import { getErrorMessage } from "@/lib/error-feedback";
import { toast } from "@/components/ui/use-toast";

type MoonPayWidgetConfig = {
  currencyCode?: string;
  baseCurrencyCode?: string;
  baseCurrencyAmount?: string;
  quoteCurrencyAmount?: string;
  lockAmount?: string;
  defaultCurrencyCode?: string;
  walletAddress?: string;
  email?: string;
  externalCustomerId?: string;
  redirectURL?: string;
  onTransactionCompleted?: (payload: MoonPayTransactionCompletedPayload) => Promise<void> | void;
};

type MoonPayTransactionStatus = "completed" | "failed" | "pending" | "waitingAuthorization" | "waitingPayment";

type MoonPayTransactionCompletedPayload = {
  id: string;
  status: MoonPayTransactionStatus;
  [key: string]: unknown;
};

type MoonPayContextValue = {
  openMoonPay: (config?: MoonPayWidgetConfig) => void;
  closeMoonPay: () => Promise<void>;
};

const MoonPayContext = createContext<MoonPayContextValue | undefined>(undefined);

const BASE_MAINNET_CHAIN_ID = 8453;
const DEFAULT_MOONPAY_CURRENCY_CODE = "eth";
const BASE_MAINNET_MOONPAY_CURRENCY_CODE = "eth_base";

const resolveDefaultMoonPayCurrencyCode = (configuredValue: string) => {
  const normalizedConfiguredValue = normalizeEnvValue(configuredValue).toLowerCase();
  if (normalizedConfiguredValue) return normalizedConfiguredValue;

  const fallbackChainId = Number(getEnvValue("VITE_TOKEN_CONTRACT_CHAIN", "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN") || "");
  if (fallbackChainId === BASE_MAINNET_CHAIN_ID) {
    return BASE_MAINNET_MOONPAY_CURRENCY_CODE;
  }

  return DEFAULT_MOONPAY_CURRENCY_CODE;
};

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const getSignUrlEndpoint = (rawSignUrl: string, baseUrl: string) => {
  const normalizedRawSignUrl = normalizeEnvValue(rawSignUrl);
  if (!normalizedRawSignUrl) return "";

  if (isAbsoluteHttpUrl(normalizedRawSignUrl)) {
    return normalizedRawSignUrl;
  }

  const normalizedBaseUrl = normalizeEnvValue(baseUrl).replace(/\/$/, "");
  if (!normalizedBaseUrl) {
    return `/${normalizedRawSignUrl.replace(/^\//, "")}`;
  }

  return `${normalizedBaseUrl}/${normalizedRawSignUrl.replace(/^\//, "")}`;
};

const extractErrorMessage = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === "string") {
    const text = payload.trim();
    return text.length ? text : null;
  }

  if (typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    const message =
      typeof value.message === "string"
        ? value.message
        : typeof value.error === "string"
          ? value.error
          : typeof value.error === "object" &&
              value.error &&
              typeof (value.error as Record<string, unknown>).message === "string"
            ? ((value.error as Record<string, unknown>).message as string)
            : null;
    return message?.trim() || null;
  }

  return null;
};

const extractSignatureFromValue = (value: string) => {
  const cleaned = value.trim().replace(/^"|"$/g, "");
  if (!cleaned) return "";

  if (cleaned.startsWith("http") || cleaned.includes("signature=")) {
    const match = cleaned.match(/[?&]signature=([^&#]+)/i);
    if (!match?.[1]) return "";
    const rawParam = match[1];
    try {
      return decodeURIComponent(rawParam);
    } catch {
      return rawParam;
    }
  }

  return cleaned;
};

const extractSignature = (payload: unknown): string => {
  if (!payload) return "";

  if (typeof payload === "string") {
    return extractSignatureFromValue(payload);
  }

  if (typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    if (typeof value.signature === "string") {
      return extractSignatureFromValue(value.signature);
    }
    if (typeof value.signedUrl === "string") {
      return extractSignatureFromValue(value.signedUrl);
    }

    if (value.data && typeof value.data === "object") {
      const nested = value.data as Record<string, unknown>;
      if (typeof nested.signature === "string") {
        return extractSignatureFromValue(nested.signature);
      }
      if (typeof nested.signedUrl === "string") {
        return extractSignatureFromValue(nested.signedUrl);
      }
    }
  }

  return "";
};

export function MoonPayProviderWrapper({ children }: PropsWithChildren) {
  const apiKey = normalizeEnvValue(getEnvValue("NEXT_PUBLIC_MOONPAY_API_KEY", "VITE_MOONPAY_API_KEY"));
  const rawSignUrl = getEnvValue("NEXT_PUBLIC_MOONPAY_SIGN_URL", "VITE_MOONPAY_SIGN_URL");
  const signUrlEndpoint = getSignUrlEndpoint(rawSignUrl, siteConfig.wallet.apiBaseUrl);
  const moonPaySigningAuthToken = normalizeEnvValue(
    getEnvValue("NEXT_PUBLIC_MOONPAY_SIGN_BEARER_TOKEN", "VITE_MOONPAY_SIGN_BEARER_TOKEN") ||
      getEnvValue("NEXT_PUBLIC_MOONPAY_SIGNING_AUTH_TOKEN", "VITE_MOONPAY_SIGNING_AUTH_TOKEN") ||
      "",
  );
  const defaultWalletAddress = normalizeEnvValue(
    getEnvValue("NEXT_PUBLIC_MOONPAY_WALLET_ADDRESS", "VITE_MOONPAY_WALLET_ADDRESS"),
  );
  const defaultEmail = normalizeEnvValue(getEnvValue("NEXT_PUBLIC_MOONPAY_EMAIL", "VITE_MOONPAY_EMAIL"));
  const defaultExternalCustomerId = normalizeEnvValue(
    getEnvValue("NEXT_PUBLIC_MOONPAY_EXTERNAL_CUSTOMER_ID", "VITE_MOONPAY_EXTERNAL_CUSTOMER_ID"),
  );
  const defaultRedirectUrl = normalizeEnvValue(
    getEnvValue("NEXT_PUBLIC_MOONPAY_REDIRECT_URL", "VITE_MOONPAY_REDIRECT_URL"),
  );
  const defaultCurrencyCode = resolveDefaultMoonPayCurrencyCode(
    getEnvValue("NEXT_PUBLIC_MOONPAY_CURRENCY_CODE", "VITE_MOONPAY_CURRENCY_CODE"),
  );
  const defaultBaseCurrencyCode = normalizeEnvValue(
    getEnvValue("NEXT_PUBLIC_MOONPAY_BASE_CURRENCY_CODE", "VITE_MOONPAY_BASE_CURRENCY_CODE") || "usd",
  );

  const [isVisible, setIsVisible] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [config, setConfig] = useState<MoonPayWidgetConfig>({
    baseCurrencyCode: defaultBaseCurrencyCode || "usd",
    currencyCode: defaultCurrencyCode || "eth",
    lockAmount: "false",
    walletAddress: defaultWalletAddress || undefined,
    email: defaultEmail || undefined,
    externalCustomerId: defaultExternalCustomerId || undefined,
    redirectURL: defaultRedirectUrl || undefined,
  });
  const handledTransactionIdsRef = useRef<Set<string>>(new Set());

  const closeMoonPay = useCallback(async () => {
    setIsVisible(false);
  }, []);

  const openMoonPay = useCallback(
    (nextConfig?: MoonPayWidgetConfig) => {
      if (!apiKey) {
        toast({
          variant: "destructive",
          title: "MoonPay API key missing",
          description: "Configure NEXT_PUBLIC_MOONPAY_API_KEY (or VITE_MOONPAY_API_KEY).",
        });
        return;
      }

      if (!signUrlEndpoint) {
        toast({
          variant: "destructive",
          title: "MoonPay sign endpoint missing",
          description: "Configure NEXT_PUBLIC_MOONPAY_SIGN_URL (or VITE_MOONPAY_SIGN_URL).",
        });
        return;
      }

      handledTransactionIdsRef.current.clear();
      setConfig((previous) => {
        const selectedCurrencyCode =
          nextConfig?.currencyCode || nextConfig?.defaultCurrencyCode || previous.currencyCode || previous.defaultCurrencyCode;
        const selectedDefaultCurrencyCode = selectedCurrencyCode
          ? undefined
          : nextConfig?.defaultCurrencyCode || previous.defaultCurrencyCode;
        const selectedWalletAddress =
          (nextConfig?.walletAddress || previous.walletAddress || defaultWalletAddress)?.trim() || undefined;

        return {
          ...previous,
          baseCurrencyAmount: undefined,
          quoteCurrencyAmount: undefined,
          lockAmount: "false",
          ...nextConfig,
          currencyCode: selectedCurrencyCode,
          defaultCurrencyCode: selectedDefaultCurrencyCode,
          walletAddress: selectedWalletAddress,
        };
      });
      setWidgetKey((previous) => previous + 1);
      setIsVisible(true);
    },
    [apiKey, defaultWalletAddress, signUrlEndpoint],
  );

  const handleSignatureRequest = useCallback(
    async (url: string): Promise<string> => {
      if (!signUrlEndpoint) {
        throw new Error("MoonPay signing endpoint is not configured.");
      }

      const response = await fetch(signUrlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(moonPaySigningAuthToken ? { Authorization: `Bearer ${moonPaySigningAuthToken}` } : {}),
        },
        body: JSON.stringify({
          urlForSignature: url,
        }),
      });

      const responseText = await response.text();
      let payload: unknown = responseText;
      try {
        payload = JSON.parse(responseText);
      } catch {
        // Keep raw text payload
      }

      if (!response.ok) {
        const reason = extractErrorMessage(payload) || `Failed to sign MoonPay URL (${response.status})`;
        throw new Error(reason);
      }

      const signature = extractSignature(payload).trim();
      if (!signature) {
        throw new Error("MoonPay signature missing from sign API response.");
      }

      return signature;
    },
    [moonPaySigningAuthToken, signUrlEndpoint],
  );

  const handleTransactionCompleted = useCallback(
    async (payload: MoonPayTransactionCompletedPayload) => {
      if (payload?.status !== "completed") return;

      const transactionId = payload?.id?.trim();
      if (transactionId && handledTransactionIdsRef.current.has(transactionId)) {
        return;
      }
      if (transactionId) {
        handledTransactionIdsRef.current.add(transactionId);
      }

      if (!config.onTransactionCompleted) return;
      await config.onTransactionCompleted(payload);
    },
    [config],
  );

  const contextValue = useMemo(() => ({ openMoonPay, closeMoonPay }), [openMoonPay, closeMoonPay]);

  const widgetProps = useMemo(() => {
    const entries = Object.entries(config).filter(
      ([key, value]) => key !== "onTransactionCompleted" && value !== undefined && value !== null,
    );
    return Object.fromEntries(entries) as Omit<MoonPayWidgetConfig, "onTransactionCompleted">;
  }, [config]);

  const renderMoonPayWidget = apiKey.length > 0 && signUrlEndpoint.length > 0;

  const content = (
    <MoonPayContext.Provider value={contextValue}>
      {children}
      {renderMoonPayWidget && widgetKey > 0 ? (
        <MoonPayBuyWidget
          key={widgetKey}
          variant="overlay"
          visible={isVisible}
          onClose={closeMoonPay}
          onUrlSignatureRequested={async (url) => {
            try {
              return await handleSignatureRequest(url);
            } catch (error) {
              toast({
                variant: "destructive",
                title: "MoonPay signature failed",
                description: getErrorMessage(error, "Unable to sign MoonPay URL."),
              });
              throw error;
            }
          }}
          onTransactionCompleted={async (payload) => {
            try {
              await handleTransactionCompleted(payload as MoonPayTransactionCompletedPayload);
            } catch (error) {
              toast({
                variant: "destructive",
                title: "MoonPay callback failed",
                description: getErrorMessage(error, "Transaction completion callback failed."),
              });
            }
          }}
          {...widgetProps}
        />
      ) : null}
    </MoonPayContext.Provider>
  );

  if (!apiKey) {
    return content;
  }

  return <MoonPaySdkProvider apiKey={apiKey}>{content}</MoonPaySdkProvider>;
}

export function useMoonPay() {
  const context = useContext(MoonPayContext);
  if (!context) {
    throw new Error("useMoonPay must be used within MoonPayProviderWrapper");
  }
  return context;
}
