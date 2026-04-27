# Veritas Villages DAO — MultiChain Voting dApp

## Overview

A sovereign, frictionless decentralized governance platform for Veritas Villages communities. Enables BTC-secured voting via Rootstock (RSK) and gasless Celo-based voting using Account Abstraction (Privy embedded wallets).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/veritas-dao)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Web3 Auth**: Privy (embedded wallets, Account Abstraction)
- **Chains**: Celo Alfajores (testnet, chainId 44787) + RSK Testnet (chainId 31)
- **Vote SDK**: Vocdoni SDK (@vocdoni/sdk)
- **Charts**: Recharts

## Architecture

### Frontend (`artifacts/veritas-dao`)
- **Dashboard** — Live DAO stats, active proposals, cross-chain activity feed
- **Proposals** — Full list with Celo/RSK/All chain filter
- **Proposal Detail** — Description, vote tally charts by chain, vote action
- **Vote Flow** — Privy wallet connect → balance check → submit vote → tx hash
- **Bridge** — BTC → rBTC mock UI (Rootstock Powpeg flow)
- **Admin** — Create proposal form (chain, census token, end date)

### Backend (`artifacts/api-server`)
Routes at `/api`:
- `GET/POST /proposals` — list and create proposals
- `GET /proposals/:id` — get proposal by ID
- `POST /proposals/:id/vote` — cast a vote (deduped by wallet address)
- `GET /proposals/:id/results` — vote tally by chain
- `GET /stats/dashboard` — DAO summary stats
- `GET /stats/chain-activity` — recent on-chain activity feed

### Database (`lib/db`)
Tables: `proposals`, `votes`
Enums: `chain` (celo/rsk), `census` (rbtc/cusd), `status` (active/ended/pending), `choice` (yes/no/abstain)

## Chains

| Chain | ChainID | Census Token | Explorer |
|-------|---------|-------------|---------|
| Celo Alfajores | 44787 | cUSD | https://alfajores.celoscan.io |
| RSK Testnet | 31 | rBTC | https://explorer.testnet.rootstock.io |

## Key Environment Variables

- `PRIVY_APP_ID` — Privy dashboard App ID (injected via Vite define as VITE_PRIVY_APP_ID)
- `VITE_CELO_RPC` — Celo RPC endpoint
- `VITE_RSK_RPC` — RSK RPC endpoint
- `VITE_VOCDONI_ENV` — Vocdoni environment (dev/stg/prod)
- `DATABASE_URL` — PostgreSQL connection string

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/veritas-dao run dev` — run frontend locally

## Seeded Proposals
1. Playa Pacifica Solar Upgrade (RSK, rBTC census)
2. Nicaragua Land Registry on Celo (Celo, cUSD census)
3. Community Treasury Diversification (RSK, rBTC census)
4. Celo Gasless Voting Infrastructure (Celo, cUSD census)
5. RSK Multisig for Village Council (RSK, ended)
6. Monthly Water Allocation Vote (Celo, ended)
