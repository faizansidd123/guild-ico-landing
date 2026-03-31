import { useAlchemyAccountContext, useAuthModal } from "@account-kit/react";
import { useBalance, useAccount, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getEnvValue, parseChainId } from "@/lib/env-utils";
import { formatAddress } from "@/lib/eth";
import { throwToastedError } from "@/lib/error-feedback";
import { useUnifiedWallet } from "@/providers/unifiedWalletProvider";

export const resolveWalletConnectingState = ({
  isConnecting,
  isLoading,
  connectedAddress,
}: {
  isConnecting: boolean;
  isLoading: boolean;
  connectedAddress: string;
}) => {
  return isConnecting || (isLoading && connectedAddress.trim().length === 0);
};

export const shouldClearPersistedConnectedAddress = ({
  rawConnectedAddress,
  unifiedIsConnected,
  wagmiIsConnected,
  isConnecting,
  isAuthModalOpen,
}: {
  rawConnectedAddress: string;
  unifiedIsConnected: boolean;
  wagmiIsConnected: boolean;
  isConnecting: boolean;
  isAuthModalOpen: boolean;
}) => {
  return !rawConnectedAddress && !unifiedIsConnected && !wagmiIsConnected && !isConnecting && !isAuthModalOpen;
};

export const useWalletAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [persistedConnectedAddress, setPersistedConnectedAddress] = useState("");

  const { config: alchemyConfig } = useAlchemyAccountContext();
  const wagmiConfig = alchemyConfig._internal.wagmiConfig;
  const { openAuthModal, closeAuthModal, isOpen: isAuthModalOpen } = useAuthModal();
  const { address: wagmiAddress, chainId: wagmiChainId, isConnected: wagmiIsConnected } = useAccount({ config: wagmiConfig });
  const { switchChainAsync } = useSwitchChain({ config: wagmiConfig });

  const {
    isConnected: unifiedIsConnected,
    connectionType,
    smartAccountAddress,
    signerAddress,
    sendGaslessTransaction,
    canAddTokenToWallet,
    addTokenToWallet,
    logout,
    isLoading,
    error,
    clearError,
  } = useUnifiedWallet();

  const configuredChainId = useMemo(
    () => parseChainId(getEnvValue("VITE_TOKEN_CONTRACT_CHAIN", "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN"), 84532),
    [],
  );

  const rawConnectedAddress = smartAccountAddress || signerAddress || wagmiAddress || "";
  const connectedAddress = rawConnectedAddress || persistedConnectedAddress;
  const shortAddress = connectedAddress ? formatAddress(connectedAddress) : "";
  const isConnected = Boolean(connectedAddress) || unifiedIsConnected || wagmiIsConnected;

  const chainId = useMemo(() => {
    if (typeof wagmiChainId === "number" && wagmiChainId > 0) {
      return wagmiChainId;
    }

    if (isConnected) {
      return configuredChainId;
    }

    return null;
  }, [wagmiChainId, configuredChainId, isConnected]);

  const { data: balanceData } = useBalance({
    config: wagmiConfig,
    address: connectedAddress ? (connectedAddress as `0x${string}`) : undefined,
    chainId: chainId || undefined,
    query: {
      enabled: Boolean(connectedAddress),
    },
  });

  const balanceEth = balanceData?.formatted || "0";

  useEffect(() => {
    if (rawConnectedAddress) {
      setPersistedConnectedAddress(rawConnectedAddress);
    }
  }, [rawConnectedAddress]);

  useEffect(() => {
    if (isConnected && connectedAddress) {
      setIsConnecting(false);
    }
  }, [connectedAddress, isConnected]);

  useEffect(() => {
    if (!isConnected || !connectedAddress || !isAuthModalOpen) {
      return;
    }

    const closeTimer = window.setTimeout(() => {
      closeAuthModal();
    }, 0);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [closeAuthModal, connectedAddress, isAuthModalOpen, isConnected]);

  useEffect(() => {
    if (!isAuthModalOpen && isConnecting && !isConnected) {
      setIsConnecting(false);
    }
  }, [isAuthModalOpen, isConnecting, isConnected]);

  useEffect(() => {
    if (
      !shouldClearPersistedConnectedAddress({
        rawConnectedAddress,
        unifiedIsConnected,
        wagmiIsConnected,
        isConnecting,
        isAuthModalOpen,
      })
    ) {
      return;
    }

    if (persistedConnectedAddress) {
      setPersistedConnectedAddress("");
    }
  }, [
    rawConnectedAddress,
    unifiedIsConnected,
    wagmiIsConnected,
    isConnecting,
    isAuthModalOpen,
    persistedConnectedAddress,
  ]);

  const connectWallet = useCallback(() => {
    clearError();
    setIsConnecting(true);
    openAuthModal();
  }, [openAuthModal, clearError]);

  const disconnectWallet = useCallback(() => {
    logout();
    clearError();
    setIsConnecting(false);
    setPersistedConnectedAddress("");
  }, [logout, clearError]);

  const ensureChainMatch = useCallback(
    async (targetChainId: number) => {
      if (!targetChainId || chainId === targetChainId) {
        return;
      }

      if (connectionType === "embedded") {
        throwToastedError(
          `Embedded wallet is configured for chain ${configuredChainId}. Switch network by reconnecting with external wallet or update TOKEN_CONTRACT_CHAIN env.`,
          "Network error",
        );
      }

      if (!switchChainAsync) {
        throwToastedError("Network switch is not available for this wallet.", "Network error");
      }

      await switchChainAsync({ chainId: targetChainId });
    },
    [chainId, connectionType, configuredChainId, switchChainAsync],
  );

  return {
    isConnected,
    isConnecting: resolveWalletConnectingState({
      isConnecting,
      isLoading,
      connectedAddress,
    }),
    connectionType,
    connectedAddress,
    shortAddress,
    chainId,
    balanceEth,
    sendGaslessTransaction,
    canAddTokenToWallet,
    addTokenToWallet,
    walletError: error || "",
    connectWallet,
    disconnectWallet,
    ensureChainMatch,
    expectedChainId: configuredChainId,
  };
};
