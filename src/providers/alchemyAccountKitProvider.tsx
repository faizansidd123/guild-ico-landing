import { type PropsWithChildren } from "react";

import { alchemy, base, baseSepolia, mainnet, sepolia } from "@account-kit/infra";
import { AlchemyAccountProvider, createConfig as createAlchemyConfig } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, walletConnect } from "wagmi/connectors";

import { getEnvValue, parseChainId } from "@/lib/env-utils";
import { UnifiedWalletProvider } from "@/providers/unifiedWalletProvider";

const queryClient = new QueryClient();

const alchemyApiKey = getEnvValue("NEXT_PUBLIC_ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY");
const reownProjectId = getEnvValue("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "VITE_WALLETCONNECT_PROJECT_ID");

const mainnetChainId = parseChainId(getEnvValue("NEXT_PUBLIC_ETH_MAINNET_CHAIN_ID", "VITE_ETH_MAINNET_CHAIN_ID"), mainnet.id);
const sepoliaChainId = parseChainId(getEnvValue("NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_ID", "VITE_ETH_SEPOLIA_CHAIN_ID"), sepolia.id);
const baseChainId = parseChainId(getEnvValue("NEXT_PUBLIC_BASE_CHAIN_ID", "VITE_BASE_CHAIN_ID"), base.id);
const baseSepoliaChainId = parseChainId(getEnvValue("NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID", "VITE_BASE_SEPOLIA_CHAIN_ID"), baseSepolia.id);
const chainId = parseChainId(
  getEnvValue("VITE_TOKEN_CONTRACT_CHAIN", "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN"),
  baseSepoliaChainId,
);

const getChain = (selectedChainId: number) => {
  switch (selectedChainId) {
    case mainnetChainId:
      return mainnet;
    case sepoliaChainId:
      return sepolia;
    case baseChainId:
      return base;
    case baseSepoliaChainId:
      return baseSepolia;
    default:
      return baseSepolia;
  }
};

const selectedChain = getChain(chainId);
const supportedWagmiChains = [mainnet, sepolia, base, baseSepolia] as const;
const supportedAlchemyChains = supportedWagmiChains.map((chain) => ({ chain }));
const wagmiConnectors = reownProjectId
  ? [injected({ target: "metaMask" }), walletConnect({ projectId: reownProjectId, showQrModal: true })]
  : [injected({ target: "metaMask" })];
const externalWalletSection = reownProjectId
  ? {
      type: "external_wallets" as const,
      walletConnectProjectId: reownProjectId,
      walletConnect: {
        projectId: reownProjectId,
        showQrModal: true,
      },
      wallets: ["metamask", "wallet_connect"],
      chainType: ["evm"] as const,
      numFeaturedWallets: 2,
      hideMoreButton: true,
    }
  : ({ type: "external_wallets" as const, wallets: ["metamask"], chainType: ["evm"] as const });

const alchemyConfig = createAlchemyConfig(
  {
    transport: alchemy({ apiKey: alchemyApiKey }),
    chain: selectedChain,
    chains: supportedAlchemyChains,
    connectors: wagmiConnectors,
    ssr: false,
  },
  {
    auth: {
      sections: [[{ type: "email" }], [externalWalletSection]],
      addPasskeyOnSignup: false,
    },
  },
);

export function AlchemyAccountKitProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
        <UnifiedWalletProvider>{children}</UnifiedWalletProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
