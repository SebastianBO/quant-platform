# AI Agent Architecture (Jan 14, 2026)

## Overview

Lician's AI agent is inspired by [virattt/dexter](https://github.com/virattt/dexter) - an autonomous financial research agent. Our implementation uses the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) with multi-model support via [Vercel AI Gateway](https://vercel.com/docs/ai-sdk).

## Quick Reference

### Architecture
- **5-Phase Workflow**: Understand → Plan → Execute → Reflect → Answer
- **Multi-Model**: Vercel AI Gateway (GPT-4o, Claude, Llama, Gemini)
- **25 Tools**: Supabase (11) + Financial Datasets API (5) + Firecrawl (5) + EU (4)

### Key Files
```
src/lib/ai/agent/
├── orchestrator.ts    # Main Agent class with 5-phase workflow
├── prompts.ts         # System prompts for each phase
├── types.ts           # TypeScript types and Zod schemas
└── index.ts           # Public exports

src/lib/ai/
├── tools.ts           # All 25 financial tools
└── financial-datasets-api.ts  # API fallback client

src/app/api/chat/
├── autonomous/route.ts  # Streaming agent API
└── public/route.ts      # Basic chat API

src/components/
└── AutonomousChat.tsx   # Morphic-style UI
```

## 5-Phase Workflow (Dexter-Inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER QUERY                                    │
│              "What is Apple's PE ratio?"                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: UNDERSTAND                                             │
│  - Extract intent: "Retrieve PE ratio for Apple"                 │
│  - Extract entities: [ticker: AAPL, metric: PE ratio]           │
│  - Classify complexity: simple/moderate/complex                  │
│  Uses: generateObject() with UnderstandingSchema                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: PLAN                                                   │
│  - Create task breakdown                                         │
│  - Tasks: [{id, description, taskType: use_tools|reason}]       │
│  - Task dependencies for execution order                         │
│  Uses: generateObject() with PlanSchema                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: EXECUTE                                                │
│  - Select tools for each task (just-in-time selection)          │
│  - Execute tools against Supabase data                          │
│  - Auto-populate ticker args from entities (fallback fix)       │
│  Uses: generateObject() with ToolSelectionSchema                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: REFLECT                                                │
│  - Evaluate if we have enough data                              │
│  - If incomplete: loop back to PLAN (max 3 iterations)          │
│  - If complete: proceed to ANSWER                               │
│  Uses: generateObject() with ReflectionSchema                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: ANSWER                                                 │
│  - Synthesize findings from all task results                    │
│  - Generate final response with key findings first              │
│  - Stream response chunks for real-time UI                      │
│  Uses: streamText() for streaming answer generation              │
└─────────────────────────────────────────────────────────────────┘
```

## Available Models (Vercel AI Gateway)

| Model | ID | Tier | Best For |
|-------|-----|------|----------|
| Gemini Flash | `google/gemini-2.0-flash` | Fast | Simple queries, low latency |
| GPT-4o Mini | `openai/gpt-4o-mini` | Standard | Balanced cost/quality |
| Claude 3.5 Sonnet | `anthropic/claude-3-5-sonnet` | Standard | Complex reasoning |
| Llama 3.3 70B | `meta/llama-3.3-70b` | Standard | Open-source alternative |
| GPT-4o | `openai/gpt-4o` | Premium | Best reasoning |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Premium | Best analysis |

## Tool Categories

### Supabase Data Tools (11)
```typescript
getStockQuote          // Real-time prices from Yahoo
getCompanyFundamentals // PE, market cap from financial_metrics
getFinancialStatements // Income/balance/cashflow from SEC data
getInsiderTrades       // Form 4 transactions
getInstitutionalOwnership // 13F holdings
getAnalystRatings      // Ratings and price targets
getShortInterest       // Short volume data
getBiotechCatalysts    // Clinical trial events
searchStocks           // Search 141k+ companies
getMarketMovers        // Gainers/losers/active
compareStocks          // Side-by-side comparison
```

### External API Tools (5)
```typescript
getSECFilings          // 10-K, 10-Q, 8-K filings
getPriceHistory        // Historical prices
getFinancialNews       // News articles
getSegmentedRevenue    // Business segment breakdown
getAnalystEstimates    // EPS/revenue estimates
```

### Firecrawl Web Research Tools (5)
```typescript
deepResearch           // Multi-source autonomous research
extractFinancialData   // Schema-based extraction from IR pages
searchRecentNews       // Time-filtered news search
firecrawlAgent         // Autonomous data discovery
crawlInvestorRelations // Full IR website crawl
```

### EU Company Tools (4)
```typescript
searchEUCompanies      // 106k+ European companies
getEUCompanyDetails    // Company info by org number
getEUFinancialStatements // IFRS format financials
compareEUCompanies     // Cross-country comparison
```

## API Usage

```bash
# Get available models
curl https://lician.com/api/chat/autonomous

# Research query
curl -X POST https://lician.com/api/chat/autonomous \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Apple Q3 revenue?","model":"gpt-4o-mini","stream":false}'
```

## Environment Variables

```bash
AI_GATEWAY_API_KEY=vck_...        # Vercel AI Gateway
FIRECRAWL_API_KEY=fc-...          # Firecrawl web research
FINANCIAL_DATASETS_API_KEY=...    # Fallback API
```

## Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Vercel AI Gateway (Free) | Limited | Subject to abuse prevention |
| EODHD API | ~100k/day | Affects search, quotes |
| Firecrawl | 1k credits/month | $16/month for more |
| Financial Datasets | Pay per call | Fallback only |

## Comparison with Dexter

| Feature | Dexter | Lician | Gap |
|---------|--------|--------|-----|
| **Multi-Agent** | 4 agents (Plan, Action, Validate, Answer) | 1 agent with 5 phases | Similar |
| **Tool Selection** | Just-in-time with gpt-4-mini | Just-in-time with any model | ✅ Same |
| **Validation** | "DEFAULT TO COMPLETE" logic | Reflect phase with criteria | ✅ Implemented |
| **Data Source** | Financial Datasets API only | Supabase + fallback APIs | ✅ Better |
| **Loop Detection** | Built-in step limits | maxIterations config | ✅ Same |
| **Streaming** | Terminal UI (Ink) | SSE for web UI | ✅ Same |

## Testing

```bash
# Run all AI tests (may hit rate limits)
npx playwright test tests/ai-chat.spec.ts

# Run only Supabase tests (always work)
npx playwright test tests/ai-chat.spec.ts --grep "Search API|Model Selection|Financial Metrics"
```

## References

- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [Vercel AI Gateway](https://vercel.com/docs/ai-sdk)
- [virattt/dexter GitHub](https://github.com/virattt/dexter)
- [Firecrawl Documentation](https://docs.firecrawl.dev/introduction)

---

# Speed Architecture - How Dexter Does It (Jan 15, 2026)

## The Key Insight

**Dexter does NOT use RAG for financial data. It uses DIRECT API calls.**

This is why it's fast. Our architecture follows the same pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SPEED TIERS - QUERY PATH SELECTION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🚀 FAST PATH (90%+ of queries) - Direct Supabase SQL                       │
│  ────────────────────────────────────────────────────────────────────────   │
│  Query: "What is AAPL's PE ratio?"                                          │
│         ↓                                                                   │
│  Tool: getCompanyFundamentals({ ticker: "AAPL" })                          │
│         ↓                                                                   │
│  Supabase: SELECT * FROM financial_metrics WHERE ticker = 'AAPL'           │
│         ↓                                                                   │
│  Response: ~50-100ms                                                        │
│                                                                             │
│  🐢 SLOW PATH (rare queries) - RAG Embeddings                               │
│  ────────────────────────────────────────────────────────────────────────   │
│  Query: "What did Apple say about iPhone sales in earnings?"                │
│         ↓                                                                   │
│  Tool: searchFinancialDocuments({ query: "...", ticker: "AAPL" })          │
│         ↓                                                                   │
│  AI SDK: embed() → vector                                                   │
│         ↓                                                                   │
│  Supabase: match_documents() → cosine similarity                           │
│         ↓                                                                   │
│  Response: ~500-1000ms                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## When to Use Each Path

### FAST PATH - Direct SQL (Use for 90%+ of queries)

| Query Type | Tool | Latency |
|------------|------|---------|
| Price quotes | `getStockQuote` | ~50ms |
| PE ratio, market cap | `getCompanyFundamentals` | ~50ms |
| Revenue, income | `getFinancialStatements` | ~100ms |
| Insider trades | `getInsiderTrades` | ~100ms |
| Analyst ratings | `getAnalystRatings` | ~100ms |
| Short interest | `getShortInterest` | ~100ms |
| Compare stocks | `compareStocks` | ~150ms |

**All structured financial data = Direct SQL = FAST**

### SLOW PATH - RAG (Use only when needed)

| Query Type | Tool | Latency |
|------------|------|---------|
| "What did X say about..." | `searchFinancialDocuments` | ~500ms |
| Management commentary | `searchFinancialDocuments` | ~500ms |
| Earnings call quotes | `getSemanticContext` | ~1000ms |

**RAG = Only for unstructured text (transcripts, narratives, news)**

## Speed Optimizations Implemented

1. **Gemini Flash for tool selection** - Fast, cheap model picks tools
2. **DEFAULT TO COMPLETE** - Don't over-iterate
3. **Just-in-time tool selection** - Only load what's needed
4. **Direct Supabase queries** - No unnecessary abstraction
5. **HNSW index** - Fastest vector search algorithm
6. **halfvec storage** - 50% smaller, same speed

---

# Critical References - DO NOT HALLUCINATE

**IMPORTANT: Always reference these exact values. NEVER guess or make up model names, API endpoints, or configurations.**

## AI Models (Vercel AI Gateway)

Source: `src/app/api/chat/autonomous/route.ts`

```typescript
const AVAILABLE_MODELS = {
  // Fast (default for free users)
  'gemini-flash': { id: 'google/gemini-2.0-flash', name: 'Gemini Flash', tier: 'fast' },

  // Standard (free)
  'gpt-4o-mini': { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  'claude-3-5-sonnet': { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  'llama-3.3-70b': { id: 'meta/llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'standard' },

  // Premium (requires subscription → Stripe checkout)
  'gpt-4o': { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'premium' },
  'claude-sonnet-4': { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
}
```

**Frontend must match**: `src/components/ManusStyleHome.tsx` MODELS constant

## Stripe Configuration

- Checkout endpoint: `/api/stripe/quick-checkout?plan=monthly` or `?plan=annual`
- Premium models should redirect to Stripe checkout
- Required env vars: `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`

## Homepage Components

Source: `src/components/ManusStyleHome.tsx`

- **Carousel slides**: 3 slides (Powerful Financial Data, Share for credits, 100K+ Companies)
- **Tool buttons**: Connect Portfolio, Stock Screener, Compare Stocks, DCF Valuation, More
- **Model selector**: Bottom-left of input, shows Fast/Standard/Premium tiers

## Before Making UI Changes

1. **READ the source file first** - Don't assume what exists
2. **Check API routes for data structures** - Models, endpoints, response formats
3. **Verify constants exist** - grep before creating new ones
4. **Match backend exactly** - Frontend constants must mirror backend
