# Veritas Village DAO experiment

A frictionless multichain DAO voting dApp for **Veritas Villages** — sovereign off-grid communities across Latin America.

🌐 **Live demo:** https://frictionless-dapp-deploy.replit.app

---

## What is this?

Veritas Villages are intentional, freedom-oriented communities in Nicaragua, Panama, and Costa Rica built on the **F.I.R.S.T. principles**: Freedom, Independence, Resiliency, Self-Sustainability, and Transparency.

This DAO dApp lets residents govern their communities on-chain — no HOA boards, no hidden rules. Every resident has a vote.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + TypeScript |
| **Wallet / AA** | Privy embedded wallets (Account Abstraction v3) |
| **Voting** | Vocdoni SDK (decentralized, censorship-resistant) |
| **Chain 1** | Celo Alfajores testnet (chainId 44787) — gasless, cUSD census |
| **Chain 2** | Rootstock RSK Testnet (chainId 31) — rBTC census |
| **Backend** | Express + Node.js |
| **Database** | PostgreSQL via Drizzle ORM |
| **Storage** | Replit Object Storage |
| **Monorepo** | pnpm workspaces |

---

## Features

### Dashboard
- Real Veritas Villages community data (Playa Pacifica, Coronado, Chiriquí, Atenas)
- F.I.R.S.T. principles from veritasvillages.com
- Live DAO stats: proposals, votes, unique voters
- Active proposals with yes/no vote progress bars
- Real-time activity feed

### Proposals
- Browse all DAO proposals across both chains
- Filter by chain (RSK / Celo) and status (active / ended)
- Full proposal detail with images and voting interface

### Voting
- Gasless voting on Celo Alfajores via Vocdoni SDK
- rBTC-weighted voting on RSK Testnet
- Census-based eligibility (rBTC holders / cUSD holders)
- Results anchored on-chain with transaction hash

### Create Proposal (Admin)
- Multi-image upload to object storage
- Chain selector (RSK or Celo) with visual network cards
- Start/end date picker
- Signs proposal metadata with Privy wallet

### Asset Bridge
- **BTC ↔ rBTC**: Rootstock PowPeg instructions + one-click "Add Network" to wallet
- **Send Tokens**: Native rBTC / CELO transfers signed via Privy wallet, with real-time balance display
- **Faucets**: Auto-filled wallet address in RSK + Celo Alfajores faucet URLs

---

## Design System

- **Theme**: RegenFi / regenerative finance
- **Primary green**: `#2D5A3A` (terra green)
- **Accent gold**: `#F7931A` (BTC gold)
- Monospace typography, glass-morphism UI
- Powered by: Vocdoni · Rootstock · Celo
- Built at: Ipê City

---

## Project Structure

```
/
├── artifacts/
│   ├── veritas-dao/          # React + Vite frontend
│   │   └── src/
│   │       ├── pages/        # dashboard, proposals, admin, bridge, vote
│   │       ├── components/   # layout, UI primitives
│   │       └── hooks/        # useChainBalance, Privy hooks
│   └── api-server/           # Express backend
│       └── src/
│           └── routes/       # proposals, votes, storage, stats
├── lib/
│   ├── db/                   # Drizzle schema + migrations
│   └── api-client-react/     # React Query hooks for API
└── README.md
```

---

## Community Networks

| Community | Country | Status |
|---|---|---|
| Veritas Village – Playa Pacifica | 🇳🇮 Nicaragua | Active |
| Veritas Village – Coronado | 🇵🇦 Panama | Active |
| Veritas Village – Chiriquí | 🇵🇦 Panama | Active |
| Veritas Village – Atenas | 🇨🇷 Costa Rica | Coming Soon |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend
pnpm --filter @workspace/veritas-dao run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `PRIVY_APP_ID` | Privy application ID |
| `VOCDONI_ORGANIZER_PRIVATE_KEY` | Vocdoni organizer wallet private key |
| `VOCDONI_ENV` | Vocdoni environment (`dev` or `prod`) |
| `SESSION_SECRET` | Express session secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Replit object storage bucket ID |

---

## Links

- [Veritas Villages](https://www.veritasvillages.com)
- [Vocdoni SDK](https://developer.vocdoni.io)
- [Rootstock RSK](https://rootstock.io)
- [Celo](https://celo.org)
- [Privy](https://privy.io)

---

*Built at [Ipê City](https://ipecity.com) — RegenFi experiment for sovereign community governance.*
