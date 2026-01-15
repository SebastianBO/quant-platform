# Quant Platform (lician.com)

## Project Overview

**Site**: lician.com - Financial data and stock analysis platform
**Tech Stack**: Next.js 16, React, Supabase, Tailwind CSS, Vercel AI SDK
**Build**: Use `next build --webpack` (avoid Turbopack bugs)

## Quick Commands

```bash
# Setup (first time)
npm install                         # Install dependencies
npx playwright install chromium     # Install browser for tests

# Development
npm run dev                    # Start dev server
npm run build                  # Build (use --webpack flag)
npx playwright test            # Run UI tests
npx tsx scripts/ui-audit.ts    # Run UI audit

# Data Sync (manual triggers)
curl https://lician.com/api/monitoring/scraper-status  # Check health
curl https://lician.com/api/cron/sync-financials       # Sync SEC data
curl https://lician.com/api/cron/sync-prices           # Sync prices
```

## Key Stats (Jan 2026)

| Metric | Value |
|--------|-------|
| US Companies | 5,345 |
| EU Companies | 106,975 |
| Financial Records | 839K+ |
| AI Tools | 25 |
| AI Models | 6 (via Vercel Gateway) |

## Documentation Index

Detailed documentation is split into focused files. Read only when working on specific features.

| Doc | Purpose | When to Read |
|-----|---------|--------------|
| [AI_AGENT.md](docs/AI_AGENT.md) | 5-phase workflow, 25 tools, model configs, speed architecture | AI/chat features |
| [DATA_PIPELINE.md](docs/DATA_PIPELINE.md) | Cron jobs, SEC EDGAR, EU markets, Supabase schema | Data sync issues |
| [RAG_INFRASTRUCTURE.md](docs/RAG_INFRASTRUCTURE.md) | pgvector, embeddings, semantic search | RAG/vector search |
| [ROADMAP.md](docs/ROADMAP.md) | Feature gaps, priority matrix, target architecture | Strategic planning |
| [SEO_AUTOMATION.md](docs/SEO_AUTOMATION.md) | Weekly audit orchestrator, content generation | SEO tasks |
| [ANALYTICS.md](docs/ANALYTICS.md) | GA4, PostHog, Clarity tracking | Analytics setup |
| [EMAIL.md](docs/EMAIL.md) | Elastic Email, DNS records, templates | Email features |
| [REVENUE.md](docs/REVENUE.md) | Stripe products, affiliate, API pricing | Monetization |
| [UI_TESTING.md](docs/UI_TESTING.md) | Playwright, audit script, viewport testing | Testing/QA |
| [MOBILE_APP.md](docs/MOBILE_APP.md) | Expo app, App Store links | Mobile features |

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                              │
│   Web (lician.com)  │  Mobile App  │  Developer API              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AI AGENT (5-Phase Workflow)                    │
│   Understand → Plan → Execute → Reflect → Answer                 │
│   25 tools: Supabase (11) + External APIs (5) + Firecrawl (5)   │
│              + EU Tools (4)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│   Supabase (839K+ records)  │  Vector DB (RAG)  │  External APIs │
│   US: 5,345 companies       │  SEC Filings      │  EODHD, Yahoo  │
│   EU: 106,975 companies     │  Earnings         │  Firecrawl     │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

```
src/lib/ai/
├── agent/orchestrator.ts    # 5-phase AI workflow
├── agent/prompts.ts         # System prompts
├── tools.ts                 # 25 financial tools
└── financial-datasets-api.ts

src/app/api/
├── chat/autonomous/route.ts # Streaming AI endpoint
├── cron/                    # Data sync jobs
├── stripe/                  # Payment endpoints
└── v1/                      # Public API

src/components/
├── ManusStyleHome.tsx       # Homepage with AI chat
├── AutonomousChat.tsx       # Chat UI
└── BrokerAffiliate.tsx      # Revenue component
```

## Environment Variables

```bash
# Required
AI_GATEWAY_API_KEY=vck_...           # Vercel AI Gateway
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional
FIRECRAWL_API_KEY=fc-...             # Web research
FINANCIAL_DATASETS_API_KEY=...       # Fallback API
STRIPE_SECRET_KEY=sk_...             # Payments
```

## Available AI Models

| Model | ID | Tier |
|-------|-----|------|
| Gemini Flash | `google/gemini-2.0-flash` | Fast (default) |
| GPT-4o Mini | `openai/gpt-4o-mini` | Standard |
| Claude 3.5 Sonnet | `anthropic/claude-3-5-sonnet` | Standard |
| Llama 3.3 70B | `meta/llama-3.3-70b` | Standard |
| GPT-4o | `openai/gpt-4o` | Premium |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Premium |

## Critical Rules

1. **Speed**: Use FAST PATH (direct Supabase SQL) for 90%+ of queries. RAG only for unstructured text.
2. **Build**: Always use `next build --webpack` not turbopack
3. **Models**: Frontend constants in `ManusStyleHome.tsx` must match backend in `autonomous/route.ts`
4. **Data**: US uses US-GAAP tables, EU uses IFRS tables - intentionally separate schemas

---

*For detailed documentation, see the `docs/` folder. Each file is self-contained with examples and troubleshooting.*
