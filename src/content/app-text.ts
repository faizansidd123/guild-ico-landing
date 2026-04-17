type LegalSection = {
  heading: string;
  body: string;
};

type LegalDocumentContent = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const appText = {
  common: {
    brandName: "Guild",
  },
  notFound: {
    code: "404",
    title: "Oops! Page not found",
    returnHome: "Return to Home",
    routeErrorPrefix: "404 Error: User attempted to access non-existent route:",
  },
  navbar: {
    homeAriaLabel: "Go to top",
    menuToggleAriaLabel: "Toggle menu",
    wallet: {
      connectedToastTitle: "Wallet connected",
      connectedToastDescription: "You can now participate in the token sale.",
      connectionFailedTitle: "Wallet connection failed",
      addressCopiedTitle: "Wallet address copied",
      copyFailedTitle: "Copy failed",
      copyFailedFallback: "Unable to copy wallet address. Please try again.",
      retryFallback: "Please retry.",
      connectingCompact: "CONNECTING...",
      connectCompact: "CONNECT",
      copyAddress: "COPY ADDRESS",
      disconnect: "DISCONNECT",
      connectWallet: "CONNECT WALLET",
    },
  },
  footer: {
    socialHeading: "Social",
    socialLinks: {
      x: "Twitter / X",
      discord: "Discord",
      telegram: "Telegram",
      medium: "Medium",
    },
    disclaimerHeading: "ICO Disclaimer",
    disclaimerBody:
      "$GILD tokens are utility tokens and do not represent securities. Participation in the token sale involves risk. This is not financial advice. Please conduct your own research before participating.",
    legalLinks: {
      terms: "Terms",
      privacy: "Privacy",
      risk: "Risk Disclosure",
      cookies: "Cookies",
    },
    rightsReservedSuffix: "All rights reserved.",
  },
  legalPage: {
    backToHome: "← Back to Home",
    lastUpdatedPrefix: "Last updated:",
  },
  legalDocuments: {
    terms: {
      title: "Token Sale Terms",
      updatedAt: "March 18, 2026",
      sections: [
        {
          heading: "Eligibility",
          body: "Participants must be legally eligible in their jurisdiction and complete required compliance checks before purchase.",
        },
        {
          heading: "Utility Token Notice",
          body: "$GILD is presented as a utility token for platform functionality. Participation does not guarantee profits.",
        },
        {
          heading: "No Investment Advice",
          body: "Information on this website is educational and product-related. It is not financial, legal, or tax advice.",
        },
        {
          heading: "Risk Acknowledgement",
          body: "Crypto assets are volatile and may lose value. Smart contract, liquidity, and regulatory risks can affect outcomes.",
        },
      ],
    } satisfies LegalDocumentContent,
    privacy: {
      title: "Privacy Policy",
      updatedAt: "March 18, 2026",
      sections: [
        {
          heading: "Data Collected",
          body: "We may collect wallet addresses, email submissions, and compliance-related details where required.",
        },
        {
          heading: "Usage",
          body: "Data is used for sale administration, compliance checks, and user communication about platform updates.",
        },
        {
          heading: "Retention",
          body: "Records are retained based on legal obligations and operational requirements, then securely removed.",
        },
        {
          heading: "Contact",
          body: "For privacy requests, contact privacy@guildprotocol.io.",
        },
      ],
    } satisfies LegalDocumentContent,
    cookies: {
      title: "Cookie Policy",
      updatedAt: "March 18, 2026",
      sections: [
        {
          heading: "Essential Cookies",
          body: "Required for session continuity, wallet connection state, and basic site functionality.",
        },
        {
          heading: "Analytics",
          body: "Used to measure campaign performance and user flows in order to improve product and onboarding.",
        },
        {
          heading: "Preference Storage",
          body: "Referral codes and form drafts may be stored locally in your browser.",
        },
        {
          heading: "Control",
          body: "You can clear browser storage at any time, though this may reset saved state on the website.",
        },
      ],
    } satisfies LegalDocumentContent,
    riskDisclosure: {
      title: "Risk Disclosure",
      updatedAt: "March 18, 2026",
      sections: [
        {
          heading: "Market Risk",
          body: "Token prices may fluctuate significantly. There is no guarantee of liquidity or future value.",
        },
        {
          heading: "Technical Risk",
          body: "Smart contracts, wallet software, or network disruptions may cause delays or loss of funds.",
        },
        {
          heading: "Regulatory Risk",
          body: "Regulatory rules can change rapidly and may impact token availability or platform operations.",
        },
        {
          heading: "Operational Risk",
          body: "Roadmaps and product timelines may change based on development, security, and market constraints.",
        },
      ],
    } satisfies LegalDocumentContent,
  },
  heroCenter: {
    imageAlt: "Guild IP Character",
    liveBadge: "◈ LIVE",
    tokenBadge: "$GILD",
  },
  heroLeft: {
    explorePlatform: "EXPLORE PLATFORM",
    joinTokenSale: "JOIN TOKEN SALE",
  },
  platformFeatures: {
    heading: {
      eyebrow: "PLATFORM FEATURES",
      titlePrefix: "Built for the",
      titleAccent: "Next Generation",
    },
  },
  tokenUtility: {
    heading: {
      eyebrow: "TOKEN UTILITY",
      titlePrefix: "$GILD",
      titleSuffix: "Token Utility",
    },
    description:
      "The Guild token powers the platform ecosystem. Users can earn tokens through activity, use them for platform services, stake for rewards, and trade them on open markets.",
    imageAlt: "Guild Creator",
  },
  roadmap: {
    heading: {
      eyebrow: "ROADMAP",
      title: "Execution Milestones",
    },
  },
  faq: {
    heading: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
    },
  },
  community: {
    imageAlt: "Guild Community",
  },
  waitlist: {
    validation: {
      nameRequired: "Enter your name",
      emailRequired: "Enter a valid email",
    },
    heading: {
      eyebrow: "COMMUNITY",
      title: "Stay Updated with Guild",
      description: "Join the community waitlist for launch updates, staking rewards, and ecosystem grants.",
    },
    form: {
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      submitIdle: "Join Waitlist",
      submitLoading: "Submitting...",
    },
    toasts: {
      successTitle: "You are on the waitlist",
      successDescription: "We will send updates on sale phases and product launches.",
      failureTitle: "Submission failed",
      failureFallback: "Please try again later.",
    },
    errors: {
      submissionFailedPrefix: "Waitlist submission failed",
    },
  },
  trust: {
    heading: {
      eyebrow: "TRUST CENTER",
      title: "Contracts, Audit and Verification",
    },
    addressesTitle: "On-chain Addresses",
    verificationTitle: "Verification Links",
    labels: {
      treasury: "Treasury",
      tokenSaleContract: "Token Sale Contract",
      usdcContract: "USDC Contract",
      notConfigured: "Not configured",
    },
    copyButton: "Copy",
    copyToasts: {
      missingSuffix: "missing",
      configurePrefix: "Configure",
      configureSuffix: "in environment variables.",
      copiedSuffix: "copied",
    },
    verificationLinks: {
      auditReport: "Audit Report",
      whitepaper: "Whitepaper",
      docs: "Developer Docs",
      etherscan: "Etherscan Contract View",
      basescan: "BaseScan Contract View",
    },
    copyLabels: {
      treasuryAddress: "Treasury address",
      saleContract: "Sale contract",
      usdcContract: "USDC contract",
    },
  },
  transactions: {
    heading: {
      eyebrow: "LIVE FEED",
      title: "All User Transactions",
      description:
        "Integrated with paginated transaction API with fallback mock data until final endpoints are ready.",
    },
    totalRecordsPrefix: "Total records:",
    syncingSuffix: "• Syncing...",
    rowsLabel: "Rows:",
    loadingText: "Loading transactions...",
    noTransactionsText: "No transactions available.",
    failedToLoadPrefix: "Failed to load transactions:",
    showingPrefix: "Showing",
    ofWord: "of",
    pageLabel: "Page",
    previous: "Previous",
    next: "Next",
    tableHeaders: {
      date: "Date",
      wallet: "Wallet",
      txHash: "Tx Hash",
      chain: "Chain",
      method: "Method",
      contribution: "Contribution",
      tokens: "Tokens",
      value: "Value",
      status: "Status",
    },
  },
  tokenomics: {
    heading: {
      eyebrow: "TOKENOMICS",
      title: "Transparent Supply and Discount Windows",
      descriptionPrefix: "Public supply is set to",
      descriptionMiddle: "including",
      descriptionSuffix: "available before ICO with configurable discount tiers.",
    },
    cards: {
      preIcoAllocation: "Pre-ICO Allocation",
      remainingPublicPool: "Remaining Public Pool",
      totalPublicSupply: "Total Public Supply",
      remainingPublicPoolDetails: "Released during public sale rounds",
      totalPublicSupplyDetails: "Combined pre-ICO plus public inventory",
      preIcoDetailsPrefix: "Up to",
      preIcoDetailsSuffix: "% discount before ICO",
    },
  },
  icoTerminal: {
    paymentMethods: ["ETH", "USDT", "USDC"] as const,
    labels: {
      terminalTitle: "Guild Token Sale Terminal",
      tokenPrice: "TOKEN PRICE",
      network: "NETWORK",
      networkValue: "Base",
      preIcoDiscount: "Pre-ICO Discount",
      preIcoAvailableSuffix: "available pre-ICO",
      publicSupplyPrefix: "Public supply",
      discountTickerPrefix: "Discount ticker update in",
      youPay: "You Pay",
      youReceive: "You Receive",
      estimatedValuePrefix: "Estimated value:",
      fundsRaised: "Funds Raised",
      hardCap: "Hard Cap",
      tokensSold: "Tokens Sold",
      remaining: "Soft cap",
      soldSuffix: "% SOLD",
      countdownStartsIn: "Starts in",
      countdownEndsIn: "Ends in",
      countdownEndedTitle: "SALE ENDED",
      countdownEndedDescription: "This sale phase has ended.",
      countdown: {
        days: "Days",
        hours: "Hours",
        mins: "Mins",
        secs: "Secs",
      },
      walletBalancePrefix: "Wallet balance:",
      referralPrefix: "Referral:",
      referralNone: "none",
    },
    riskStatements: {
      volatility: "I understand crypto asset purchases involve volatility and protocol risk.",
      terms: "I accept sale terms, privacy policy, and jurisdiction eligibility checks.",
    },
    claimActions: {
      claimToken: "CLAIM $GILD TOKEN",
      claimRefund: "CLAIM NATIVE REFUND",
      claimRefundStable: "CLAIM STABLE REFUND",
    },
    cta: {
      saleClosed: "SALE CLOSED",
      saleNotStarted: "SALE NOT STARTED",
      connecting: "CONNECTING...",
      processing: "PROCESSING...",
      connectWallet: "CONNECT WALLET",
      buyWithUsdt: "BUY WITH USDT",
      buyWithUsdc: "BUY WITH USDC",
      acquirePrefix: "ACQUIRE $",
      switchToPrefix: "BUY",
      switchToFallback: "NETWORK",
    },
    inputErrors: {
      invalidAmount: "Enter a valid contribution amount.",
      maximumPrefix: "Maximum contribution is",
      ethEquivalentSuffix: "ETH equivalent.",
      insufficientBalance: "Insufficient wallet balance.",
    },
    throwMessages: {
      saleContractMissing: "Configure VITE_SALE_CONTRACT_ADDRESS with a valid ICO contract address.",
      usdcContractMissing: "Configure VITE_USDC_CONTRACT_ADDRESS with a valid token address.",
      usdtContractMissing: "Configure VITE_USDT_CONTRACT_ADDRESS with a valid token address.",
      walletProviderUnavailable: "Wallet provider unavailable",
      walletAccountUnavailable: "Wallet account unavailable",
    },
    toasts: {
      networkSwitchedTitle: "Network switched",
      connectedToPrefix: "Connected to",
      saleClosedTitle: "Sale closed",
      saleClosedDescription: "This sale phase has ended.",
      saleNotStartedTitle: "Sale not started",
      saleNotStartedDescription: "Token acquisition will open once the ICO start time is reached.",
      confirmationRequiredTitle: "Confirmation required",
      confirmationRequiredDescription: "Please accept the risk and terms checkboxes before continuing.",
      invalidAmountTitle: "Invalid amount",
      usdtPurchaseSubmittedTitle: "USDT purchase confirmed",
      usdcPurchaseSubmittedTitle: "USDC purchase confirmed",
      transactionSubmittedTitle: "Transaction confirmed",
      purchaseFailedTitle: "Purchase failed",
      claimFailedTitle: "Claim failed",
      retryFallback: "Please retry.",
      selectStableCoinTitle: "Select stable coin",
      selectStableCoinDescription: "Switch to the USDC or USDT tab, then retry stable refund claim.",
      txHashPrefix: "Hash:",
      claimSubmittedTitles: {
        claimToken: "Token Claimed Successfully",
        claimRefund: "Native Refund Claimed Successfully",
        claimRefundStable: "Stable Refund Claimed Successfully",
      },
    },
  },
} as const;

export type AppText = typeof appText;
