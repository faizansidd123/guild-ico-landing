import { readEnvUrl } from "@/lib/env-utils";

const buildSiteConfig = () => {
  return {
    brandName: "Guild",
    tokenSymbol: "$GILD",
    companyName: "Guild Protocol",
    year: 2026,
    socials: {
      x: readEnvUrl(import.meta.env.VITE_SOCIAL_X_URL, "https://x.com/guildtogether"),
      instagram: readEnvUrl(import.meta.env.VITE_SOCIAL_INSTAGRAM_URL, "https://www.instagram.com/guildtogether"),
      tiktok: readEnvUrl(import.meta.env.VITE_SOCIAL_TIKTOK_URL, "https://www.tiktok.com/@guildtogether"),
      discord: readEnvUrl(import.meta.env.VITE_SOCIAL_DISCORD_URL, "https://discord.com/invite/CDzDJnnaF5"),
    },
    resources: {
      whitepaper: readEnvUrl(import.meta.env.VITE_RESOURCE_WHITEPAPER_URL, "https://guildprotocol.io/whitepaper.pdf"),
      audit: readEnvUrl(import.meta.env.VITE_RESOURCE_AUDIT_URL, "https://guildprotocol.io/audit-report.pdf"),
      docs: readEnvUrl(import.meta.env.VITE_RESOURCE_DOCS_URL, "https://guildprotocol.io/docs"),
    },
    community: {
      redirectUrl: readEnvUrl(import.meta.env.VITE_COMMUNITY_REDIRECT_URL, "https://guildtogether.com/"),
    },
    wallet: {
      apiBaseUrl: readEnvUrl(import.meta.env.VITE_WALLET_API_BASE_URL, ""),
      moonPayBuyUrl: readEnvUrl(import.meta.env.VITE_MOONPAY_BUY_URL, "https://buy.moonpay.com"),
      ipfsGatewayBaseUrl: readEnvUrl(import.meta.env.VITE_IPFS_GATEWAY_BASE_URL, "https://ipfs.io/ipfs"),
      apiPaths: {
        nfts: readEnvUrl(import.meta.env.VITE_WALLET_NFTS_API_PATH, "users/alchemy/nfts"),
        tokenBalances: readEnvUrl(import.meta.env.VITE_WALLET_TOKEN_BALANCES_API_PATH, "users/alchemy/tokens-ico"),
        transactions: readEnvUrl(import.meta.env.VITE_WALLET_TRANSACTIONS_API_PATH, "moonpay/transactions-ico"),
      },
    },
    legal: {
      terms: readEnvUrl(import.meta.env.VITE_LEGAL_TERMS_URL, "https://guildtogether.com/terms"),
      privacy: readEnvUrl(import.meta.env.VITE_LEGAL_PRIVACY_URL, "https://guildtogether.com/privacy"),
      risk: "/legal/risk-disclosure",
      cookies: "/legal/cookies",
    },
    explorers: {
      baseSepoliaTx: readEnvUrl(import.meta.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL, "https://base-sepolia.blockscout.com/tx/"),
    },
  };
};

export const siteConfig = Object.freeze(buildSiteConfig());

export type SiteConfig = typeof siteConfig;
