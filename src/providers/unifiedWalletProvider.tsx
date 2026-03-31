import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { WalletClientSigner } from "@aa-sdk/core";
import { alchemy, base, baseSepolia, mainnet, sepolia } from "@account-kit/infra";
import {
  useAlchemyAccountContext,
  useLogout,
  useSigner,
  useSignerStatus,
  useUser,
} from "@account-kit/react";
import { createSmartWalletClient, type SmartWalletClient } from "@account-kit/wallet-client";
import { type Hex } from "viem";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";

import { isAddress, saleConfig } from "@/config/sale";
import { getEnvValue, parseChainId } from "@/lib/env-utils";
import { getErrorMessage, isToastedError, throwToastedError } from "@/lib/error-feedback";

type ConnectionType = "embedded" | "eoa";
type SetupState = "idle" | "in-progress" | "done";

interface TransactionParams {
  target: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
}

interface UnifiedWalletContextValue {
  isConnected: boolean;
  connectionType: ConnectionType | null;
  isLoading: boolean;
  smartAccountAddress: string | undefined;
  signerAddress: string | undefined;
  loginMethod: string;
  email: string | null;
  signMessage: (message: string) => Promise<Hex>;
  sendGaslessTransaction: (params: TransactionParams) => Promise<string>;
  sendBatchTransaction: (calls: TransactionParams[]) => Promise<string>;
  canAddTokenToWallet: boolean;
  addTokenToWallet: () => Promise<void>;
  logout: () => void;
  smartWalletClient: SmartWalletClient | null;
  error: string | null;
  clearError: () => void;
}

type SmartWalletClientConfig = Parameters<typeof createSmartWalletClient>[0];
type SmartWalletSigner = SmartWalletClientConfig["signer"];
type SendCallsParams = Parameters<SmartWalletClient["sendCalls"]>[0];

interface CallsRequest {
  from: `0x${string}`;
  calls: Array<{
    to: `0x${string}`;
    data: `0x${string}`;
    value: Hex;
  }>;
  capabilities?: {
    paymasterService: {
      policyId: string;
    };
  };
}

interface CallsStatusLike {
  receipts?: Array<{
    transactionHash?: string;
  }>;
}

interface EmbeddedSignerLike {
  inner?: {
    address?: string;
  };
  address?: string;
}

interface Eip1193TransactionRequest {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
  value?: Hex;
}

interface WalletWatchAssetRequest {
  type: "ERC20";
  options: {
    address: `0x${string}`;
    symbol: string;
    decimals: number;
    image?: string;
  };
}

const getProviderAccounts = async (provider?: {
  request<T = unknown>(args: { method: string; params?: unknown[] | object }): Promise<T>;
}) => {
  if (!provider) {
    return [];
  }

  try {
    const accounts = await provider.request<string[]>({
      method: "eth_accounts",
    });
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
};

const UnifiedWalletContext = createContext<UnifiedWalletContextValue | null>(null);

const DEFAULT_TRANSACTION_TIMEOUT = 60_000;
const MAX_SETUP_RETRIES = 3;
const RETRY_DELAY = 1_000;

const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case 1:
      return mainnet;
    case 11155111:
      return sepolia;
    case 8453:
      return base;
    case 84532:
      return baseSepolia;
    default:
      return baseSepolia;
  }
};

const validateEnvironment = () => {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  if (!getEnvValue("NEXT_PUBLIC_ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY")) {
    missingVars.push("NEXT_PUBLIC_ALCHEMY_API_KEY");
  }

  if (!getEnvValue("NEXT_PUBLIC_ALCHEMY_POLICY_ID", "VITE_ALCHEMY_POLICY_ID")) {
    warnings.push("NEXT_PUBLIC_ALCHEMY_POLICY_ID is not set - paymaster sponsorship will be disabled.");
  }

  if (!getEnvValue("VITE_TOKEN_CONTRACT_CHAIN", "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN")) {
    warnings.push("TOKEN_CONTRACT_CHAIN env is not set - defaulting to Base Sepolia (84532).");
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
};

const formatErrorMessage = (error: unknown) => {
  return getErrorMessage(error, "An unknown error occurred");
};

const extractEmbeddedSignerAddress = (signer: unknown) => {
  if (!signer || typeof signer !== "object") {
    return undefined;
  }

  const typedSigner = signer as EmbeddedSignerLike;
  return typedSigner.inner?.address ?? typedSigner.address;
};

const getFirstReceipt = (status: unknown) => {
  if (!status || typeof status !== "object") {
    return undefined;
  }

  const typedStatus = status as CallsStatusLike;
  if (!Array.isArray(typedStatus.receipts)) {
    return undefined;
  }

  return typedStatus.receipts[0];
};

export function UnifiedWalletProvider({ children }: PropsWithChildren) {
  const envValidation = useMemo(() => validateEnvironment(), []);

  useEffect(() => {
    if (!envValidation.isValid) {
      console.error("Missing required wallet environment variables:", envValidation.missingVars.join(", "));
    }

    if (envValidation.warnings.length > 0) {
      envValidation.warnings.forEach((warning) => console.warn(warning));
    }
  }, [envValidation]);

  const { config: alchemyConfig } = useAlchemyAccountContext();
  const wagmiConfig = alchemyConfig._internal.wagmiConfig;

  const signerStatus = useSignerStatus();
  const alchemyUser = useUser();
  const alchemySigner = useSigner();
  const { logout: alchemyLogout } = useLogout();

  const { isConnected: eoaIsConnected, address: eoaAddress } = useAccount({ config: wagmiConfig });
  const { data: walletClient } = useWalletClient({ config: wagmiConfig });
  const { disconnect: wagmiDisconnect } = useDisconnect({ config: wagmiConfig });

  const [smartWalletClient, setSmartWalletClient] = useState<SmartWalletClient | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const setupRef = useRef<SetupState>("idle");
  const retryCountRef = useRef(0);

  const hasEmbeddedSigner = signerStatus.isConnected && !!alchemySigner;
  const hasEoaSigner = eoaIsConnected && !!walletClient && !signerStatus.isConnected;
  const embeddedSignerAddress = useMemo(() => extractEmbeddedSignerAddress(alchemySigner), [alchemySigner]);

  const chainId = useMemo(
    () => parseChainId(getEnvValue("VITE_TOKEN_CONTRACT_CHAIN", "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN"), 84532),
    [],
  );

  const selectedChain = useMemo(() => getChainConfig(chainId), [chainId]);

  useEffect(() => {
    if (!hasEmbeddedSigner && !hasEoaSigner) {
      const hasAnyKnownAddress = Boolean(embeddedSignerAddress || eoaAddress || smartAccountAddress);

      if (!signerStatus.isConnected && !eoaIsConnected && !hasAnyKnownAddress) {
        setSmartWalletClient(null);
        setSmartAccountAddress(undefined);
        setupRef.current = "idle";
        retryCountRef.current = 0;
      }
      return;
    }

    if (setupRef.current !== "idle") {
      return;
    }

    setupRef.current = "in-progress";

    const setup = async () => {
      setLoading(true);
      setWalletError(null);

      try {
        const apiKey = getEnvValue("NEXT_PUBLIC_ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY");
        const policyId = getEnvValue("NEXT_PUBLIC_ALCHEMY_POLICY_ID", "VITE_ALCHEMY_POLICY_ID");

        if (!apiKey) {
          throwToastedError("Missing NEXT_PUBLIC_ALCHEMY_API_KEY environment variable", "Wallet setup failed");
        }

        const transport = alchemy({ apiKey });

        if (hasEoaSigner) {
          if (!walletClient || !eoaAddress) {
            throwToastedError("Wallet client or address not available", "Wallet setup failed");
          }

          const signer = new WalletClientSigner(walletClient, "external");
          const client = createSmartWalletClient({
            transport,
            chain: selectedChain,
            signer,
            policyId: policyId || undefined,
            account: eoaAddress,
          });

          setSmartWalletClient(client as unknown as SmartWalletClient);
          setSmartAccountAddress(eoaAddress);
          setupRef.current = "done";
          retryCountRef.current = 0;
          return;
        }

        if (hasEmbeddedSigner) {
          if (!alchemySigner) {
            throwToastedError("Alchemy signer not available", "Wallet setup failed");
          }

          const clientWithoutAccount = createSmartWalletClient({
            transport,
            chain: selectedChain,
            signer: alchemySigner as unknown as SmartWalletSigner,
            policyId: policyId || undefined,
          });

          const account = await clientWithoutAccount.requestAccount();

          const clientWithAccount = createSmartWalletClient({
            transport,
            chain: selectedChain,
            signer: alchemySigner as unknown as SmartWalletSigner,
            policyId: policyId || undefined,
            account: account.address,
          });

          setSmartWalletClient(clientWithAccount as unknown as SmartWalletClient);
          setSmartAccountAddress(account.address);
          setupRef.current = "done";
          retryCountRef.current = 0;
        }
      } catch (error: unknown) {
        const errorMessage = formatErrorMessage(error);
        console.error("Failed to create SmartWalletClient", error);

        setWalletError(errorMessage);
        setupRef.current = "idle";

        if (retryCountRef.current < MAX_SETUP_RETRIES) {
          retryCountRef.current += 1;
          setTimeout(() => {
            if (setupRef.current === "idle") {
              void setup();
            }
          }, RETRY_DELAY * retryCountRef.current);
        }
      } finally {
        setLoading(false);
      }
    };

    void setup();
  }, [
    hasEmbeddedSigner,
    hasEoaSigner,
    alchemySigner,
    walletClient,
    eoaAddress,
    embeddedSignerAddress,
    smartAccountAddress,
    selectedChain,
    signerStatus.isConnected,
    eoaIsConnected,
  ]);

  const connectionType: ConnectionType | null = useMemo(() => {
    if (signerStatus.isConnected) return "embedded";
    if (eoaIsConnected) return "eoa";
    return null;
  }, [signerStatus.isConnected, eoaIsConnected]);

  const isConnected = connectionType !== null;

  const signerAddress = useMemo(() => {
    if (connectionType === "embedded") {
      return embeddedSignerAddress;
    }

    if (connectionType === "eoa") {
      return eoaAddress;
    }

    return undefined;
  }, [connectionType, embeddedSignerAddress, eoaAddress]);

  const loginMethod = useMemo(() => {
    if (connectionType === "embedded") {
      if (alchemyUser?.email) {
        return "Email";
      }

      return "Passkey / Social";
    }

    if (connectionType === "eoa") {
      return "External Wallet";
    }

    return "Not connected";
  }, [connectionType, alchemyUser]);

  const email = alchemyUser?.email ?? null;

  const signMessage = useCallback(
    async (message: string): Promise<Hex> => {
      if (!message || message.trim().length === 0) {
        throwToastedError("Message cannot be empty", "Signing failed");
      }

      if (connectionType === "eoa") {
        if (!walletClient || !eoaAddress) {
          throwToastedError("EOA wallet client not available", "Signing failed");
        }

        try {
          const signature = await walletClient.signMessage({
            account: eoaAddress as `0x${string}`,
            message,
          });

          return signature as Hex;
        } catch (error: unknown) {
          throwToastedError(`Failed to sign message: ${formatErrorMessage(error)}`, "Signing failed");
        }
      }

      if (!smartWalletClient) {
        throwToastedError("Wallet not ready. Please ensure wallet is connected.", "Signing failed");
      }

      try {
        return await smartWalletClient.signMessage({ message });
      } catch (error: unknown) {
        throwToastedError(`Failed to sign message: ${formatErrorMessage(error)}`, "Signing failed");
      }
    },
    [connectionType, walletClient, eoaAddress, smartWalletClient],
  );

  const sendGaslessTransaction = useCallback(
    async (params: TransactionParams): Promise<string> => {
      if (!params.target || !params.data) {
        throwToastedError("Transaction target and data are required", "Transaction failed");
      }

      if (connectionType === "eoa") {
        const provider = window.ethereum;

        try {
          const providerAccounts = await getProviderAccounts(provider);
          const eoaTransactionAccount = (eoaAddress ||
            providerAccounts[0] ||
            smartAccountAddress ||
            signerAddress) as `0x${string}` | undefined;

          if (walletClient && eoaTransactionAccount) {
            return await walletClient.sendTransaction({
              account: eoaTransactionAccount,
              to: params.target,
              data: params.data,
              value: params.value ?? 0n,
            });
          }

          if (provider && eoaTransactionAccount) {
            const transactionRequest: Eip1193TransactionRequest = {
              from: eoaTransactionAccount,
              to: params.target,
              data: params.data,
              ...(params.value && params.value > 0n
                ? { value: `0x${params.value.toString(16)}` as Hex }
                : {}),
            };

            return await provider.request<string>({
              method: "eth_sendTransaction",
              params: [transactionRequest],
            });
          }

          throwToastedError("EOA wallet client not available", "Transaction failed");
        } catch (error: unknown) {
          throwToastedError(`Transaction failed: ${formatErrorMessage(error)}`, "Transaction failed");
          console.log("transaction failed--1--",error)
        }
      }

      if (!smartWalletClient) {
        throwToastedError("Wallet not ready. Please ensure wallet is connected.", "Transaction failed");
      }

      if (!smartAccountAddress) {
        throwToastedError("Smart account address not available", "Transaction failed");
      }

      const policyId = getEnvValue("NEXT_PUBLIC_ALCHEMY_POLICY_ID", "VITE_ALCHEMY_POLICY_ID");

      const callParams: CallsRequest = {
        from: smartAccountAddress as `0x${string}`,
        calls: [
          {
            to: params.target,
            data: params.data,
            value: params.value ? (`0x${params.value.toString(16)}` as Hex) : ("0x0" as Hex),
          },
        ],
      };

      if (policyId) {
        callParams.capabilities = {
          paymasterService: {
            policyId,
          },
        };
      }

      try {
        const result = await smartWalletClient.sendCalls(callParams as SendCallsParams);
        const status = await smartWalletClient.waitForCallsStatus({
          id: result.id,
          timeout: DEFAULT_TRANSACTION_TIMEOUT,
        });

        const receipt = getFirstReceipt(status);
        const transactionHash = receipt?.transactionHash ?? result.id;

        if (!transactionHash) {
          throwToastedError("Transaction hash not found in receipt", "Transaction failed");
        }

        return transactionHash;
      } catch (error: unknown) {
        if (isToastedError(error)) {
          throw error;
        }

        throwToastedError(`Transaction failed: ${formatErrorMessage(error)}`, "Transaction failed");
        console.log("transaction failed--2--",error)

      }
    },
    [connectionType, walletClient, eoaAddress, smartWalletClient, smartAccountAddress, signerAddress],
  );

  const sendBatchTransaction = useCallback(
    async (calls: TransactionParams[]): Promise<string> => {
      if (!smartWalletClient) {
        throwToastedError("Wallet not ready. Please ensure wallet is connected.", "Batch transaction failed");
      }

      if (!smartAccountAddress) {
        throwToastedError("Smart account address not available", "Batch transaction failed");
      }

      if (!calls || calls.length === 0) {
        throwToastedError("At least one transaction call is required", "Batch transaction failed");
      }

      const policyId = getEnvValue("NEXT_PUBLIC_ALCHEMY_POLICY_ID", "VITE_ALCHEMY_POLICY_ID");

      const callParams: CallsRequest = {
        from: smartAccountAddress as `0x${string}`,
        calls: calls.map((call) => ({
          to: call.target,
          data: call.data,
          value: call.value ? (`0x${call.value.toString(16)}` as Hex) : ("0x0" as Hex),
        })),
      };

      if (policyId) {
        callParams.capabilities = {
          paymasterService: {
            policyId,
          },
        };
      }

      try {
        const result = await smartWalletClient.sendCalls(callParams as SendCallsParams);
        const status = await smartWalletClient.waitForCallsStatus({
          id: result.id,
          timeout: DEFAULT_TRANSACTION_TIMEOUT,
        });

        const receipt = getFirstReceipt(status);
        const transactionHash = receipt?.transactionHash ?? result.id;

        if (!transactionHash) {
          throwToastedError("Transaction hash not found in receipt", "Batch transaction failed");
        }

        return transactionHash;
      } catch (error: unknown) {
        if (isToastedError(error)) {
          throw error;
        }

        throwToastedError(`Batch transaction failed: ${formatErrorMessage(error)}`, "Batch transaction failed");
        console.log("transaction failed--3--",error)

      }
    },
    [smartWalletClient, smartAccountAddress],
  );

  const canAddTokenToWallet = Boolean(eoaAddress) && Boolean(walletClient || window.ethereum);

  const addTokenToWallet = useCallback(async () => {
    if (!eoaAddress) {
      throwToastedError("Connect an external wallet before adding the token.", "Add token failed");
    }

    if (!isAddress(saleConfig.walletTokenAddress)) {
      throwToastedError("Configure a valid wallet token address before adding the token.", "Add token failed");
    }

    const watchAssetRequest: WalletWatchAssetRequest = {
      type: "ERC20",
      options: {
        address: saleConfig.walletTokenAddress as `0x${string}`,
        symbol: saleConfig.tokenSymbol,
        decimals: saleConfig.tokenDecimals,
        ...(saleConfig.walletTokenImageUrl ? { image: saleConfig.walletTokenImageUrl } : {}),
      },
    };

    try {
      const wasAdded = walletClient
        ? await walletClient.watchAsset(watchAssetRequest)
        : await window.ethereum?.request<boolean>({
            method: "wallet_watchAsset",
            params: watchAssetRequest,
          });

      if (!wasAdded) {
        throwToastedError(`${saleConfig.tokenSymbol} was not added to the wallet.`, "Add token failed");
      }
    } catch (error: unknown) {
      if (isToastedError(error)) {
        throw error;
      }

      throwToastedError(`Failed to add token: ${formatErrorMessage(error)}`, "Add token failed");
    }
  }, [eoaAddress, walletClient]);

  const logout = useCallback(() => {
    try {
      if (connectionType === "embedded") {
        alchemyLogout();
      }

      if (connectionType === "eoa") {
        wagmiDisconnect();
      }

      setSmartWalletClient(null);
      setSmartAccountAddress(undefined);
      setWalletError(null);
      setupRef.current = "idle";
      retryCountRef.current = 0;
    } catch (error: unknown) {
      console.error("Error during wallet logout", error);
      setSmartWalletClient(null);
      setSmartAccountAddress(undefined);
      setupRef.current = "idle";
    }
  }, [connectionType, alchemyLogout, wagmiDisconnect]);

  const clearError = useCallback(() => {
    setWalletError(null);
  }, []);

  const value: UnifiedWalletContextValue = useMemo(
    () => ({
      isConnected,
      connectionType,
      isLoading: loading,
      smartAccountAddress,
      signerAddress,
      loginMethod,
      email,
      signMessage,
      sendGaslessTransaction,
      sendBatchTransaction,
      canAddTokenToWallet,
      addTokenToWallet,
      logout,
      smartWalletClient,
      error: walletError,
      clearError,
    }),
    [
      isConnected,
      connectionType,
      loading,
      smartAccountAddress,
      signerAddress,
      loginMethod,
      email,
      signMessage,
      sendGaslessTransaction,
      sendBatchTransaction,
      canAddTokenToWallet,
      addTokenToWallet,
      logout,
      smartWalletClient,
      walletError,
      clearError,
    ],
  );

  return <UnifiedWalletContext.Provider value={value}>{children}</UnifiedWalletContext.Provider>;
}

export function useUnifiedWallet() {
  const context = useContext(UnifiedWalletContext);

  if (!context) {
    throwToastedError(
      "useUnifiedWallet must be used inside UnifiedWalletProvider. Wrap the app in <UnifiedWalletProvider>.",
      "Wallet context error",
    );
  }

  return context;
}
