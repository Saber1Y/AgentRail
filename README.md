# AgentRail

<p align="center">
  <img src="/public/logo.png" alt="AgentRail" width="220" />
</p>

<p align="center">
  AI agent payments on Stellar — pay-per-task with blockchain settlement.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="Stellar" src="https://img.shields.io/badge/Stellar-XLM-7D00FF?logo=stellar" />
  <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai" />
  <img alt="x402" src="https://img.shields.io/badge/x402-Micro--payments-FF6B35" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-Runtime-FBF000?logo=bun" />
</p>

## Overview

AgentRail is a **production-ready MVP** for AI agent payments on Stellar. It demonstrates a paid-agent marketplace where users pay per task with real blockchain settlement.

The app combines:

- A landing page showcasing the product loop
- Real AI agent execution powered by GPT-4
- Stellar testnet payments (x402 + MPP patterns)
- Dynamic quote generation and run settlement
- Receipt history with local persistence

## What AgentRail Does

1. User writes a task/objective
2. AgentRail generates a **real quote** with dynamic pricing
3. AI agent **actually executes** the task
4. Payments settle on **Stellar testnet** using x402/MPP patterns
5. Receipt and deliverables are returned

## Core Features

### Quote Builder

- Three workflow types: Prospecting, Procurement, Travel
- Dynamic pricing based on task complexity
- x402/MPP/Stellar payment breakdown
- Real trace ID generation

### AI Execution

- GPT-4 powered task completion
- Workflow-specific prompts for each use case
- Real deliverables generated from the objective
- Token usage tracking

### Payment Settlement

- x402 pattern for per-request payments
- MPP pattern for session holds
- Stellar anchoring for receipts
- Transaction hash for verification

### Receipt System

- Full receipt with transaction details
- JSON export for verification
- Local history persistence
- Settlement status tracking

## Supported Workflows

| Workflow | Use Case | Payment Rails |
|----------|----------|---------------|
| Prospecting | Lead generation, buying signals | x402 + MPP + Stellar |
| Procurement | Vendor comparison, research | x402 + Stellar |
| Travel | Trip planning, route optimization | MPP + Stellar |

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Bun runtime
- Stellar SDK
- OpenAI GPT-4
- x402 micropayments
- MPP (Multi-Phase Payments)

## Quick Start

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open `http://localhost:3000`.

## Environment

Use `.env.local` for local development.

Public browser-safe values:

- None required for demo mode

Server-only values:

- `OPENAI_API_KEY` - OpenAI API key for AI execution
- `STELLAR_SECRET_KEY` - Stellar testnet secret key
- `STELLAR_PUBLIC_KEY` - Stellar testnet public key
- `EXA_API_KEY` - Optional, for web search enrichment

An example template is included in [.env.example](./.env.example).

## Demo Flow

1. Select a workflow preset (Prospecting, Procurement, or Travel)
2. Enter a task in the objective field
3. Click "Generate Quote" — shows pricing breakdown
4. Click "Start Paid Run" — AI executes, payments process
5. View deliverables and transaction hash
6. Copy JSON to show full receipt structure

## Project Structure

```text
app/
├── page.jsx                    # Landing page
├── components/
│   └── WorkflowBoard.jsx       # Main UI component
├── api/
│   ├── quote/route.js         # Quote generation API
│   └── run/route.js           # Run execution API
└── lib/
    ├── workflows.js            # Workflow execution engine
    └── services/
        ├── stellar.js          # Stellar SDK integration
        ├── ai-agent.js         # OpenAI integration
        └── search.js           # Web search enrichment
```

Key files:

- `app/lib/workflows.js` - Workflow definitions and execution
- `app/lib/services/stellar.js` - Stellar testnet payments
- `app/lib/services/ai-agent.js` - GPT-4 agent execution
- `app/lib/services/search.js` - Web search enrichment

## Payment Patterns

### x402

Per-request payments for data access. Used when the agent needs to unlock a data source.

### MPP (Multi-Phase Payments)

Session holds for long-running tasks. Creates an escrow that settles based on actual execution.

### Stellar Settlement

Final transaction anchoring the receipt on-chain. Produces a verifiable transaction hash.

## Without API Keys

The app runs in **simulation mode** without API keys configured. The UI and flow work completely, but:

- AI returns simulated results (still looks good for demo)
- Payments show as simulated transactions

## License

MIT
