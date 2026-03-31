🚀 ICO Landing Page

A modern and responsive ICO (Initial Coin Offering) landing page built using React JS. This project provides a sleek UI for showcasing token details, roadmap, team, and wallet integration features.

📌 Features

⚡ Fully responsive design

🎨 Modern UI/UX

🔗 Wallet connection (EOA / Smart Wallet)

💰 Token information & pricing

📊 Roadmap & project details

👥 Team section

📢 Announcement / Activity feed

🔔 Push notifications support (if integrated)

🛠️ Tech Stack

React JS

TypeScript (if used)

Redux / Context API

CSS / SCSS / Tailwind (update as per your project)

Web3 / Wallet Integration (Alchemy / WalletConnect if used)

Wallet Dashboard API envs (for Send / Receive / Buy / Transactions / View Assets modal):

- `VITE_WALLET_API_BASE_URL`
- `VITE_WALLET_NFTS_API_PATH` (default: `users/alchemy/nfts`)
- `VITE_WALLET_TOKEN_BALANCES_API_PATH` (default: `users/alchemy/token-balance`)
- `VITE_WALLET_TRANSACTIONS_API_PATH` (default: `moonpay/transactions`)
- `VITE_MOONPAY_BUY_URL` (default: `https://buy.moonpay.com`)
- `VITE_IPFS_GATEWAY_BASE_URL` (default: `https://ipfs.io/ipfs`)

MoonPay SDK envs (compatible with your other repo naming):

- `NEXT_PUBLIC_MOONPAY_API_KEY` (or `VITE_MOONPAY_API_KEY`)
- `NEXT_PUBLIC_MOONPAY_SIGN_URL` (or `VITE_MOONPAY_SIGN_URL`) e.g. `moonpay/url`
- `NEXT_PUBLIC_MOONPAY_SIGN_BEARER_TOKEN` / `NEXT_PUBLIC_MOONPAY_SIGNING_AUTH_TOKEN` (optional)
- `NEXT_PUBLIC_MOONPAY_CURRENCY_CODE` (optional)
- `NEXT_PUBLIC_MOONPAY_BASE_CURRENCY_CODE` (optional, default `usd`)
- `NEXT_PUBLIC_MOONPAY_WALLET_ADDRESS` (optional fallback)
- `NEXT_PUBLIC_MOONPAY_EMAIL` (optional)
- `NEXT_PUBLIC_MOONPAY_EXTERNAL_CUSTOMER_ID` (optional)
- `NEXT_PUBLIC_MOONPAY_REDIRECT_URL` (optional)
