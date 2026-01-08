# Chat Source Attribution System

This document explains how Lician's autonomous research agent attributes data sources in chat responses.

## Source Types

The chat system uses visual badges to indicate where data comes from:

| Badge | Type | Description | Color |
|-------|------|-------------|-------|
| **Lician Data** | `lician` | Data from our Supabase database (cached/scraped) | Green |
| **Web Research** | `web` | Real-time web search results | Blue |
| **SEC Filing** | `sec` | SEC EDGAR filings (10-K, 10-Q, 8-K, Form 4) | Amber |
| **Company Data** | `company` | Company fundamentals and profiles | Purple |
| **Market Data** | `market` | Real-time stock quotes and prices | Cyan |
| **Deep Thinking** | `deep-thinking` | Multi-step reasoning and analysis | Violet |
| **Firecrawl** | `firecrawl` | AI-powered web scraping results | Orange |

## How Source Attribution Works

### 1. Tool Execution
When the AI agent executes a tool, each tool returns a `source` field:

```typescript
// Example tool response
{
  success: true,
  source: 'lician-database', // or 'realtime-api', 'sec-edgar', etc.
  data: { ... }
}
```

### 2. Source Mapping
The orchestrator maps tool sources to badge types:

| Tool Source | Badge Type |
|-------------|------------|
| `lician-database`, `supabase` | `lician` |
| `web`, `firecrawl`, `search` | `web` |
| `sec-edgar`, `sec-filings` | `sec` |
| `company-api`, `profile` | `company` |
| `realtime-api`, `yahoo`, `eodhd` | `market` |
| `deep-research` | `deep-thinking` |
| `firecrawl-*` | `firecrawl` |

### 3. Rendering in Chat
Sources are displayed at the bottom of assistant messages using the `<SourceCitation>` component:

```tsx
import { SourceCitation } from "@/components/ui/source-badge"

<SourceCitation
  sources={[
    { type: "lician", name: "Financial Statements" },
    { type: "sec", name: "10-K Filing", url: "https://sec.gov/..." },
    { type: "web", name: "Reuters" }
  ]}
/>
```

## Components

### SourceBadge
Single source indicator:
```tsx
<SourceBadge type="lician" />
<SourceBadge type="web" label="Google News" />
<SourceBadge type="sec" label="10-K 2024" />
```

### SourceCitation
Multiple sources with optional URLs:
```tsx
<SourceCitation sources={[
  { type: "lician", name: "Income Statements" },
  { type: "market", name: "Real-time Quote" },
]} />
```

### StockTickerChip
Clickable stock ticker that opens a profile popup:
```tsx
import { StockTickerChip } from "@/components/StockProfilePopup"

<StockTickerChip symbol="AAPL" />
```

## Deep Thinking Indicator

When the agent performs multi-step reasoning (>2 iterations), a "Deep Thinking" badge is shown. This indicates:
- The agent gathered data from multiple sources
- Cross-referenced information
- Performed comparative analysis
- Applied financial models (DCF, ratios, etc.)

## Data Flow

```
User Query
    ↓
Agent Orchestrator (5-phase workflow)
    ↓
Tool Execution → Each tool returns {data, source}
    ↓
Source Aggregation → Collect all unique sources
    ↓
Answer Generation → Include sources in response
    ↓
UI Rendering → Display badges in chat
```

## Adding New Sources

To add a new source type:

1. Update `SourceType` in `source-badge.tsx`:
```typescript
export type SourceType = "lician" | "web" | "sec" | ... | "new-source"
```

2. Add configuration:
```typescript
const SOURCE_CONFIG = {
  // ...existing
  "new-source": {
    icon: IconComponent,
    label: "New Source",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
}
```

3. Map tool responses to the new source in the orchestrator.

## Best Practices

1. **Always attribute sources** - Every piece of financial data should have a visible source
2. **Link to primary sources** - When possible, include URLs to SEC filings, news articles, etc.
3. **Show confidence** - Use Deep Thinking badge when analysis involves multiple data points
4. **Be transparent** - Distinguish between cached data (Lician) and real-time data (Market)
