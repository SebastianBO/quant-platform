# Autonomous Financial Research Agent

## Overview

Lician's autonomous research agent is inspired by [virattt/dexter](https://github.com/virattt/dexter) and implements a 5-phase reasoning workflow for comprehensive financial research.

**Live at:** https://lician.com (main page) and https://lician.com/research

## Architecture

### 5-Phase Workflow

```
User Query
    ↓
┌─────────────────┐
│  1. UNDERSTAND  │  Extract intent, entities, complexity
└────────┬────────┘
         ↓
┌─────────────────┐
│    2. PLAN      │  Create 2-5 research tasks
└────────┬────────┘
         ↓
┌─────────────────┐
│   3. EXECUTE    │  Run tools, gather data
└────────┬────────┘
         ↓
┌─────────────────┐
│   4. REFLECT    │  Evaluate completeness
└────────┬────────┘
         ↓ (loop back to Plan if incomplete, max 3 iterations)
┌─────────────────┐
│   5. ANSWER     │  Synthesize final response
└─────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/ai/agent/orchestrator.ts` | Main Agent class with 5-phase workflow |
| `src/lib/ai/agent/prompts.ts` | System prompts for each phase |
| `src/lib/ai/agent/types.ts` | TypeScript types and schemas |
| `src/lib/ai/tools.ts` | All 21 financial tools |
| `src/app/api/chat/autonomous/route.ts` | API endpoint with streaming |
| `src/components/AutonomousChat.tsx` | Morphic-style UI component |

## Multi-Model Support

The agent uses **Vercel AI Gateway** to support multiple LLM providers:

### Available Models

| Model Key | Provider | Tier | Best For |
|-----------|----------|------|----------|
| `gpt-4o` | OpenAI | Premium | Complex reasoning |
| `claude-sonnet-4` | Anthropic | Premium | Complex reasoning |
| `gpt-4o-mini` | OpenAI | Standard | Balanced (default) |
| `claude-3-5-sonnet` | Anthropic | Standard | Balanced |
| `llama-3.3-70b` | Meta | Standard | Cost-effective |
| `gemini-flash` | Google | Fast | Quick queries |

### API Usage

```typescript
// POST /api/chat/autonomous
{
  "query": "What is Apple's Q3 revenue?",
  "model": "gpt-4o-mini",  // optional, defaults to gpt-4o-mini
  "stream": true
}
```

### GET Available Models

```bash
curl https://lician.com/api/chat/autonomous
# Returns: { models: { ... } }
```

## Tools (21 Total)

### Core Supabase Tools (11)

These pull data from our Supabase database:

| Tool | Description | Key Args |
|------|-------------|----------|
| `getStockQuote` | Real-time price, change, volume | `ticker` |
| `getCompanyFundamentals` | PE, margins, growth metrics | `ticker` |
| `getFinancialStatements` | Income, balance, cash flow | `ticker`, `statement_type`, `period` |
| `getInsiderTrades` | Insider buying/selling | `ticker`, `days` |
| `getInstitutionalOwnership` | Top institutional holders | `ticker` |
| `getAnalystRatings` | Buy/sell ratings summary | `ticker` |
| `getShortInterest` | Short interest data | `ticker`, `days` |
| `getBiotechCatalysts` | FDA dates, trial results | `ticker`, `days_ahead` |
| `searchStocks` | Search by name or criteria | `query`, `limit` |
| `getMarketMovers` | Top gainers/losers/active | `type`, `limit` |
| `compareStocks` | Side-by-side comparison | `ticker1`, `ticker2` |

### Financial Datasets API Tools (5)

Fallback to [financialdatasets.ai](https://financialdatasets.ai) when Supabase lacks data:

| Tool | Description | Key Args |
|------|-------------|----------|
| `getSECFilings` | 10-K, 10-Q, 8-K filings | `ticker`, `form_type`, `limit` |
| `getPriceHistory` | Historical OHLCV data | `ticker`, `days` |
| `getFinancialNews` | News with sentiment | `ticker`, `limit` |
| `getSegmentedRevenue` | Revenue by segment | `ticker`, `period`, `limit` |
| `getAnalystEstimates` | EPS/revenue forecasts | `ticker` |

### Advanced Firecrawl Tools (5)

For web research when database doesn't have the data:

| Tool | Description | Key Args |
|------|-------------|----------|
| `deepResearch` | Autonomous multi-source research | `query`, `maxDepth`, `maxUrls`, `timeLimit` |
| `extractFinancialData` | Schema-based extraction from IR pages | `urls`, `prompt`, `dataType` |
| `searchRecentNews` | Time-filtered news search | `query`, `timeRange`, `limit`, `newsOnly` |
| `firecrawlAgent` | Autonomous data discovery | `prompt`, `focusUrls` |
| `crawlInvestorRelations` | Full IR website crawl | `url`, `maxPages` |

## UI Design

The chat interface uses a **Morphic-style** design inspired by [morphic.sh](https://beta.morphic.sh):

### Features

- Clean, minimal layout
- Collapsible research plan section
- Collapsible data sources section
- Model selector dropdown with tier badges
- Auto-resizing textarea
- Streaming responses with phase indicators
- Copy button on responses
- Suggestion cards for empty state

### Key UI Components

```
src/components/
├── AutonomousChat.tsx      # Main chat component
├── ui/
│   ├── collapsible.tsx     # Expandable sections
│   ├── textarea.tsx        # Auto-resize input
│   ├── skeleton.tsx        # Loading states
│   └── dropdown-menu.tsx   # Model selector
```

## Environment Variables

Required in `.env.local`:

```bash
# Vercel AI Gateway
AI_GATEWAY_API_KEY=vck_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Firecrawl (for web research tools)
FIRECRAWL_API_KEY=fc-...

# Financial Datasets API (fallback)
FINANCIAL_DATASETS_API_KEY=...
```

## Rate Limiting

- **10 requests per hour** per IP
- Rate limit resets hourly
- Remaining quota returned in response

## Streaming Events

The API streams Server-Sent Events:

```typescript
type StreamEvent =
  | { type: 'phase', data: Phase }
  | { type: 'model', data: { key: string, name: string } }
  | { type: 'remaining', data: number }
  | { type: 'plan', data: { tasks: Task[] } }
  | { type: 'task-start', data: Task }
  | { type: 'task-complete', data: { task: Task, result: TaskResult } }
  | { type: 'answer-chunk', data: string }
  | { type: 'complete', data: null }
  | { type: 'error', data: string }
```

## Example Queries

The agent handles:

1. **Simple**: "What is Apple's stock price?"
2. **Moderate**: "Compare Tesla vs Rivian fundamentals"
3. **Complex**: "Analyze NVIDIA's Q3 earnings and provide outlook based on recent news"

## Dexter Comparison

| Feature | Dexter | Lician Agent |
|---------|--------|--------------|
| 5-phase workflow | ✅ | ✅ |
| Structured outputs (Zod) | ✅ | ✅ |
| Loop detection | ✅ | ✅ (max 3 iterations) |
| Multi-model | OpenAI/Anthropic | Vercel AI Gateway (6 models) |
| Data source | financialdatasets.ai | Supabase + fallbacks |
| UI | Terminal (Ink) | Web (Morphic-style) |
| Streaming | ✅ | ✅ (SSE) |

## Future Improvements

- [ ] Add voice input
- [ ] Export research to PDF
- [ ] Save research history
- [ ] Compare multiple stocks in single query
- [ ] Add chart generation
