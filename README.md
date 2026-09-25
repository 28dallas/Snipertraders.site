# SniperTraders

**Direct-Execution Deriv Trading Companion**

SniperTraders is a web-based trading execution suite built for Deriv traders. It provides direct, non-custodial access to Deriv's WebSocket API for manual trading, automated strategy runs, bot creation, digit analysis, and portfolio reporting.

## Key Features

- **Direct Deriv OAuth 2.0 & WebSocket Client**: Client-side execution where account tokens never touch an intermediate server. Direct connection to `wss://ws.derivws.com`.
- **Manual Trader (D-Trader)**: Live tick subscriptions, dynamic charting, and instant proposal-to-buy order placement.
- **Bot Builder & Auto Trader**: Run strategies continuously against live streaming ticks with take-profit and stop-loss risk guards.
- **Free Bots Catalog**: Pre-engineered trading bots ready for instant one-click deployment.
- **Bulk Trader**: Synchronized order placement across multiple synthetic index markets.
- **Smart Analysis & Speedbot**: Real-time last-digit distribution analysis and speed trading execution.
- **Consolidated Reports**: Live profit table, statement transactions, win/loss metrics, and run journals.
- **Deriv Cashier Integration**: Direct non-custodial deep links to Deriv deposit, withdrawal, and transfer services.
- **PWA Ready**: Installable application with offline shell and manifest.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Dark theme: `#0a0e1a` base with cyan/amber/coral accents)
- **State Management**: Zustand
- **API**: Deriv WebSocket API (`ws.derivws.com`)

## Getting Started

1. Set your Deriv App ID in `.env.local`:
   ```bash
   NEXT_PUBLIC_DERIV_APP_ID=your_registered_deriv_app_id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   App ID `1089` is available only as a local development fallback. Production requires an app ID registered to the deployed callback URL.

2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

For the current hosted preview deployment, keep `NEXT_PUBLIC_PREVIEW_MODE=true`.
Set it to `false` in Vercel only after the signed authentication session and Deriv credentials are configured.

3. Open [http://localhost:3000](http://localhost:3000) and click **Start Trading Now** to authorize with your Deriv account.
