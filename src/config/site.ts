import { readEnvUrl } from "@/lib/env-utils";

const buildSiteConfig = () => {
  return {
    brandName: "Guild",
    tokenSymbol: "$GILD",
    companyName: "Guild Protocol",
    year: 2026,
    socials: {
      x: readEnvUrl(import.meta.env.VITE_SOCIAL_X_URL, "https://x.com/guildprotocol"),
      discord: readEnvUrl(import.meta.env.VITE_SOCIAL_DISCORD_URL, "https://discord.gg/guildprotocol"),
      telegram: readEnvUrl(import.meta.env.VITE_SOCIAL_TELEGRAM_URL, "https://t.me/guildprotocol"),
      medium: readEnvUrl(import.meta.env.VITE_SOCIAL_MEDIUM_URL, "https://medium.com/@guildprotocol"),
    },
    resources: {
      whitepaper: readEnvUrl(import.meta.env.VITE_RESOURCE_WHITEPAPER_URL, "https://guildprotocol.io/whitepaper.pdf"),
      audit: readEnvUrl(import.meta.env.VITE_RESOURCE_AUDIT_URL, "https://guildprotocol.io/audit-report.pdf"),
      docs: readEnvUrl(import.meta.env.VITE_RESOURCE_DOCS_URL, "https://guildprotocol.io/docs"),
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
      terms: "/legal/terms",
      privacy: "/legal/privacy",
      risk: "/legal/risk-disclosure",
      cookies: "/legal/cookies",
    },
  };
};

export const siteConfig = Object.freeze(buildSiteConfig());

export type SiteConfig = typeof siteConfig;
