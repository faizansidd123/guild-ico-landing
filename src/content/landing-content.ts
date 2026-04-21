export type NavItem = {
  href: `#${string}`;
  label: string;
};

export type UtilityItem = {
  icon: string;
  label: string;
};

export type FeatureHighlight = {
  icon: string;
  title: string;
  text: string;
};

export type FeatureCard = {
  imageKey: "platform" | "profile" | "fans";
  title: string;
  description: string;
  align: "left" | "right";
  fit: "cover" | "contain";
};

export type RoadmapPhase = {
  quarter: string;
  title: string;
  items: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HeroCopy = {
  eyebrow: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
};

export type StoryCopy = {
  eyebrow: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
};

export type CommunityCopy = {
  eyebrow: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
};

export const navLinks: readonly NavItem[] = [
  { href: "#platform", label: "Platform" },
  { href: "#token-sale", label: "Sale" },
  { href: "#transactions", label: "Transactions" },
  { href: "#community", label: "Community" },
  { href: "#faq", label: "FAQ" },
];

export const heroCopy: HeroCopy = {
  eyebrow: "DECENTRALIZED IP PLATFORM",
  titlePrefix: "Guild — The Future of",
  titleAccent: "IP Ownership",
  description:
    "Guild is building a decentralized platform where artists and fans collaborate, share ownership, and participate in the future of IP through blockchain technology.",
};

export const storyCopy: StoryCopy = {
  eyebrow: "PLATFORM VISION",
  titlePrefix: "A New Era of",
  titleAccent: "IP Ownership",
  description:
    "Guild connects artists and fans through decentralized tools that enable collaboration, ownership, and new revenue opportunities for creators worldwide.",
};

export const communityCopy: CommunityCopy = {
  eyebrow: "COMMUNITY",
  titlePrefix: "Join the",
  titleAccent: "Guild Network",
  description: "Creators and fans collaborate to build a decentralized IP ecosystem.",
};

export const tokenUtilityItems: readonly UtilityItem[] = [
  { icon: "◈", label: "Earn through activity" },
  { icon: "◇", label: "Platform services" },
  { icon: "◆", label: "Staking for rewards" },
  { icon: "◉", label: "Open market trading" },
];

export const featureHighlights: readonly FeatureHighlight[] = [
  { icon: "◈", title: "IP Registry", text: "Record ownership and usage rights on-chain." },
  { icon: "◆", title: "Licensing", text: "Launch clear IP licensing flows for creators and partners." },
  { icon: "◉", title: "Revenue Splits", text: "Automate royalty and payout distribution with transparency." },
];

export const platformFeatureCards: readonly FeatureCard[] = [
  {
    imageKey: "platform",
    title: "Platform Dashboard",
    description: "Current product view for discovery, drops, and creator revenue tracking.",
    align: "left",
    fit: "contain",
  },
  {
    imageKey: "profile",
    title: "Creator Identity Layer",
    description: "Artists build rich multimedia profiles tied to their on-chain identity.",
    align: "right",
    fit: "cover",
  },
  {
    imageKey: "fans",
    title: "Fan Powered Ecosystem",
    description: "Fans directly support creators and share in platform growth.",
    align: "left",
    fit: "cover",
  },
];

export const roadmapPhases: readonly RoadmapPhase[] = [
  {
    quarter: "Q2 2026",
    title: "Public Sale & Wallet Launch",
    items: ["Token sale live", "Community ambassador onboarding", "Investor dashboard beta"],
  },
  {
    quarter: "Q3 2026",
    title: "Creator Marketplace",
    items: ["Creator profile NFTs", "Fan collaboration pools", "Revenue split primitives"],
  },
  {
    quarter: "Q4 2026",
    title: "IP Protocol Phase 1",
    items: ["On-chain rights registry", "IP licensing toolkit", "Royalty split automation"],
  },
  {
    quarter: "Q1 2027",
    title: "Cross-Chain Expansion",
    items: ["Base and Ethereum liquidity", "Staking and rewards", "Global creator campaigns"],
  },
];

export const faqItems: readonly FaqItem[] = [
  {
    question: "How do I join the token sale?",
    answer: "Connect an EVM wallet, choose a payment method, and confirm the transaction.",
  },
  {
    question: "Which networks are supported?",
    answer: "Ethereum and Base are supported for wallet connectivity. You can switch directly from the sale terminal.",
  },
  {
    question: "Do I need account verification?",
    answer: "No KYC flow is required in this version of the token sale interface.",
  },
  {
    question: "Where can I verify contracts and audits?",
    answer: "Use the Trust Center section for the live token sale and Guild token contract addresses.",
  },
  {
    question: "Are purchases refundable?",
    answer: "Token sale terms define refund policy and eligibility. Read terms and risk disclosure before participating.",
  },
];

export const footerCopy = {
  brandStatement: "Building the future of decentralized IP ownership.",
};
