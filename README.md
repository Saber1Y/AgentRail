# AgentRail

<p align="center">
  <img src="/public/logo.png" alt="AgentRail" width="220" />
</p>

<p align="center">
  AI agents that pay their own way — pay-per-task with blockchain settlement.
</p>

<p align="center">
  <a href="https://www.loom.com/share/3f142f4a5f6b4d34b793244554412257"><strong>Watch Demo Video</strong></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="Stellar" src="https://img.shields.io/badge/Stellar-XLM-7D00FF?logo=stellar" />
  <img alt="OpenRouter" src="https://img.shields.io/badge/OpenRouter-Llama%203.1-FF6B35?logo=data:image/svg+xml" />
  <img alt="x402" src="https://img.shields.io/badge/x402-Micro--payments-FF6B35" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-Runtime-FBF000?logo=bun" />
</p>

---

## Overview

**AgentRail is a production-ready MVP demonstrating x402 + MPP + Stellar working together for AI agent payments.**

AI agents are stuck at payment walls. They need tools, data, and compute - but current infrastructure forces them into monthly subscriptions or manual approvals. AgentRail changes that.

The app combines:
- A polished landing page showcasing the product loop
- Real AI agent execution powered by OpenRouter (Llama 3.1)
- Actual Stellar testnet payments (x402 + MPP patterns)
- Dynamic quote generation with real transaction hashes
- Receipt history with local persistence

---

## The Problem

AI agents are the future - but they can't pay for their own tools.

- **APIs** are trapped behind subscriptions
- **Browser sessions** require manual approval
- **Premium data sources** are all-or-nothing

This breaks the promise of agentic AI. An agent that needs human intervention to pay for tools isn't really autonomous.

---

## The Solution

AgentRail makes payment part of the workflow. Three payment rails working together:

| Rail | Purpose | How It Works |
|------|---------|--------------|
| **x402** | Per-request unlock | Like a metered paywall - pay per API call |
| **MPP** | Session holds | Escrow funds during work, settle at end |
| **Stellar** | Settlement anchoring | On-chain proof of payment |

---

## How It Works

1. **User submits a task** (e.g., "Research 3 competitors for an AI coding assistant")
2. **AgentRail generates a quote** with dynamic pricing based on complexity
3. **AI agent executes** the work with MPP holding funds
4. **Payments settle on Stellar** producing a verifiable transaction hash
5. **Receipt returns** with deliverables and tx hash

---

## Core Features

### Quote Builder
- Three workflow types: Prospecting, Procurement, Travel
- Dynamic pricing based on task complexity
- x402/MPP/Stellar payment breakdown
- Real trace ID generation

### AI Execution
- OpenRouter (Llama 3.1) powered task completion
- Workflow-specific prompts for each use case
- Real deliverables generated from the objective

### Payment Settlement
- x402 pattern for per-request payments
- MPP pattern for session holds
- Stellar anchoring for receipts
- Real transaction hash for verification

### Receipt System
- Full receipt with transaction details
- JSON export for verification
- Local history persistence
- Settlement status tracking

---

## Supported Workflows

| Workflow | Use Case | Payment Rails |
|----------|----------|---------------|
| Prospecting | Lead generation, buying signals | x402 + MPP + Stellar |
| Procurement | Vendor comparison, research | x402 + Stellar |
| Travel | Trip planning, route optimization | MPP + Stellar |

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Bun runtime**
- **Stellar SDK + Horizon API**
- **OpenRouter** (Llama 3.1)
- **x402** micropayments
- **MPP** (Multi-Phase Payments)

---

## Project Structure

```text
app/
├── page.jsx                    # Landing page with hero, stats, how-it-works
├── layout.jsx                 # Root layout
├── globals.css                # All styles
├── components/
│   ├── Navbar.jsx             # Responsive navigation
│   ├── WorkflowBoard.jsx       # Main workflow UI
│   ├── LiveDemoWidget.jsx      # Interactive demo widget
│   ├── StatsCounter.jsx        # Animated statistics
│   ├── HowItWorks.jsx          # Animated flow diagram
│   └── Toast.jsx               # Notification system
├── api/
│   ├── quote/route.js          # Quote generation API
│   ├── run/route.js            # Paid run execution API
│   └── test-payment/route.js   # Payment testing
└── lib/
    ├── workflows.js             # Workflow definitions & execution
    └── services/
        ├── stellar.js           # Stellar Horizon integration
        ├── ai-agent.js         # OpenRouter integration
        └── search.js           # Web search enrichment
```

---

## Payment Patterns Explained

### x402
Per-request payments for data access. Used when the agent needs to unlock a data source. Like a digital paywall - pay to access.

### MPP (Multi-Phase Payments)
Session holds for long-running tasks. Creates an escrow that settles based on actual execution completed. Funds held until work is done.

### Stellar Settlement
Final transaction anchoring the receipt on-chain. Produces a verifiable transaction hash that proves payment happened.

---




## License

MIT
