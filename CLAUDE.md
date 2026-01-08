# Quant Platform - Claude Code Instructions

## Weekly SEO Audit Orchestrator

This project uses an automated SEO audit system. When starting a session, consider running the weekly SEO audit if it hasn't been run recently.

```typescript
// Weekly SEO audit orchestrator
async function runWeeklySEOAudit() {
  // Phase 1: Data Collection (parallel)
  const [searchConsole, analytics, siteStructure, competitors] = await Promise.all([
    Task.spawn('data-analyst', {
      prompt: `Fetch Search Console data for past 90 days:
        - Query performance (clicks, impressions, CTR, position)
        - Page performance
        - Index coverage issues
        - Core Web Vitals`,
      tools: ['google-search-console-mcp']
    }),
    Task.spawn('data-analyst', {
      prompt: `Pull GA4 organic traffic metrics:
        - Sessions by landing page
        - Engagement rate
        - Conversions from organic
        - User behavior flow`,
      tools: ['google-analytics-mcp']
    }),
    Task.spawn('Explore', {
      prompt: `Crawl site structure comprehensively:
        - All pages and their metadata (titles, descriptions, h1s)
        - Internal link structure
        - Orphaned pages (no incoming links)
        - Broken links`,
      thoroughness: 'very thorough'
    }),
    Task.spawn('seo-specialist', {
      prompt: `Analyze top 3 competitors for our target keywords:
        - Their ranking pages
        - Content structure and length
        - Backlink profiles
        - Content gaps they're filling`,
      tools: ['mcp__playwright__browser_navigate', 'mcp__playwright__browser_snapshot']
    })
  ]);

  // Phase 2: Analysis
  const analysis = await Task.spawn('seo-specialist', {
    prompt: `Synthesize all data and identify:
      1. Quick wins (can fix automatically)
      2. Content gaps (need new articles)
      3. Technical issues (need review)
      4. Link opportunities (internal linking)

      Data: ${JSON.stringify({ searchConsole, analytics, siteStructure, competitors })}`
  });

  return analysis;
}
```

## Content Generation Pipeline

When the audit identifies a content gap, Claude Code doesn't just flag it — it writes the content:

```typescript
async function generateContent(gap: ContentGap) {
  // Research phase
  const research = await Task.spawn('research-analyst', {
    prompt: `Deep research on "${gap.keyword}":
      - Current top-ranking content (structure, length, angle)
      - Statistics and data points to cite
      - Questions people ask (People Also Ask, forums)
      - Unique angles not covered by competitors`
  });

  // Outline with SEO structure
  const outline = await Task.spawn('seo-specialist', {
    prompt: `Create SEO-optimized outline:
      Target keyword: ${gap.keyword}
      Search intent: ${gap.intent}
      Competitor analysis: ${research.competitors}

      Include: H2/H3 structure, target word count, internal link opportunities`
  });

  // Write in brand voice
  const draft = await Task.spawn('josh-writer', {
    prompt: `Write article following this outline:
      ${outline}

      Style: Conversational, direct, conclusion-first
      Include: Specific examples, real numbers, actionable advice
      Avoid: Fluff, generic statements, AI-sounding phrases`
  });

  // Final SEO pass
  const optimized = await Task.spawn('seo-specialist', {
    prompt: `Optimize for SEO without killing the voice:
      - Ensure keyword in title, H1, first paragraph
      - Add schema markup recommendations
      - Suggest meta description
      - Identify internal link targets

      Content: ${draft}`
  });

  // Write to file system
  await Write({
    file_path: `src/content/articles/${gap.slug}.mdx`,
    content: optimized.content
  });

  return optimized;
}
```

## Automatic Fixes

Some issues don't need human review. Claude Code just fixes them:

```typescript
async function executeQuickWins(issues: QuickWin[]) {
  for (const issue of issues) {
    switch (issue.type) {
      case 'missing_meta_description':
        await Edit({
          file_path: issue.file,
          old_string: issue.current,
          new_string: issue.suggested
        });
        break;

      case 'broken_internal_link':
        await Edit({
          file_path: issue.file,
          old_string: issue.brokenLink,
          new_string: issue.correctLink
        });
        break;

      case 'missing_alt_text':
        // Use Playwright to check what the image shows
        const imageContext = await Task.spawn('Explore', {
          prompt: `Describe this image for alt text: ${issue.imageUrl}`
        });
        await Edit({
          file_path: issue.file,
          old_string: `alt=""`,
          new_string: `alt="${imageContext.description}"`
        });
        break;
    }
  }

  // Commit all fixes
  await Bash({ command: 'git add -A && git commit -m "fix(seo): auto-fixes from weekly audit"' });
}
```

## Weekly Audit Report Format

Every Monday, generate a structured report:

```json
{
  "audit_date": "2024-12-24T06:47:00Z",
  "duration_minutes": 12,
  "data_sources": ["search_console", "ga4", "ahrefs", "site_crawl", "competitor_analysis"],
  "pages_analyzed": 127,
  "findings": {
    "quick_wins": [
      {
        "type": "title_optimization",
        "page": "/blog/inventory-management",
        "current_title": "Inventory Tips",
        "suggested_title": "Inventory Management: 7 Strategies That Cut Costs 23%",
        "rationale": "Current title missing primary keyword, no value proposition",
        "projected_impact": "+340 monthly impressions",
        "status": "auto_fixed"
      },
      {
        "type": "missing_meta_description",
        "pages_affected": 8,
        "status": "auto_fixed"
      },
      {
        "type": "broken_internal_links",
        "count": 3,
        "status": "auto_fixed"
      }
    ],
    "content_gaps": [
      {
        "keyword": "warehouse automation ROI calculator",
        "monthly_volume": 2400,
        "difficulty": 34,
        "competitor_avg_ranking": 3,
        "our_ranking": null,
        "content_brief": {
          "angle": "Interactive calculator with real-world benchmarks",
          "word_count_target": 2500,
          "sections": ["ROI factors", "Calculator tool", "Case studies", "Implementation costs"]
        },
        "article_drafted": true,
        "draft_path": "src/content/articles/warehouse-automation-roi-calculator.mdx"
      }
    ],
    "technical_issues": [
      {
        "type": "slow_lcp",
        "pages_affected": 12,
        "cause": "Unoptimized hero images",
        "recommendation": "Convert to WebP, add explicit dimensions",
        "auto_fixable": false,
        "priority": "high"
      }
    ],
    "internal_linking": [
      {
        "source": "/blog/inventory-optimization",
        "target": "/blog/abc-xyz-analysis",
        "anchor_text": "ABC-XYZ matrix",
        "rationale": "High-traffic page linking to underperforming page with relevant content"
      }
    ]
  },
  "actions_taken": {
    "auto_fixed": 11,
    "articles_drafted": 1,
    "link_suggestions": 8,
    "pr_created": "https://github.com/org/site/pull/847"
  },
  "week_over_week": {
    "impressions": "+12%",
    "clicks": "+8%",
    "avg_position": "-0.3 (improved)"
  }
}
```

## Generated Content Sample

Here's what an auto-generated article brief looks like:

```markdown
# Article: Warehouse Automation ROI Calculator

## Target Keyword
warehouse automation ROI (2,400/mo, KD 34)

## Search Intent
Transactional/Informational hybrid - users want to calculate
their specific ROI before making a decision

## Content Structure
1. **The Real Cost of Warehouse Automation** (400 words)
   - Beyond equipment: implementation, training, integration
   - Hidden costs most calculators miss

2. **Interactive ROI Calculator** (embed component)
   - Inputs: current labor cost, throughput, error rate
   - Outputs: payback period, 5-year savings, efficiency gains

3. **Benchmarks by Industry** (600 words)
   - E-commerce: 18-24 month payback typical
   - Manufacturing: 12-18 months
   - 3PL: 24-36 months

4. **Case Study: Mid-Size E-commerce** (500 words)
   - $2.3M investment, 14-month payback
   - 47% reduction in labor costs
   - 99.7% pick accuracy

5. **When Automation Doesn't Make Sense** (400 words)
   - Low volume thresholds
   - High SKU variability
   - Short-term lease situations

## Internal Links
- Link to /inventory-optimization (primary)
- Link to /warehouse-layout-guide (secondary)
- Link to /case-studies/acme-fulfillment (case study)

## Schema Markup
- FAQPage (for common questions)
- HowTo (for ROI calculation steps)
```

## Project Context

- **Site**: lician.com - Financial data and stock analysis platform
- **Tech Stack**: Next.js 16, React, Supabase, Tailwind CSS
- **Build**: Use `next build --webpack` to avoid Turbopack bugs
- **MCP Tools Available**: Google Search Console (gsc), Supabase, Playwright

---

# FINANCIAL DATA PIPELINE

## Overview

Lician replicates FinancialDatasets.ai's business model using **FREE data sources**. We scrape SEC EDGAR, Yahoo Finance, FINRA, and EODHD to populate Supabase. FinancialDatasets.ai is only a fallback (with auto-caching).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                                     │
├───────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│   SEC EDGAR   │    Yahoo     │    EODHD     │    FINRA     │   Others   │
│  (FREE)       │   Finance    │   (Paid)     │   (FREE)     │            │
│  Financials   │   (FREE)     │   Prices     │   Short Vol  │ ClinTrials │
│  Insider      │   Prices     │   Batch      │              │ OpenFIGI   │
│  13F Holdings │   Estimates  │              │              │            │
└───────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────┘
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRON JOBS (Vercel + Supabase pg_cron)            │
│  sync-financials | sync-prices | sync-insider-trades | sync-short-vol   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE (Cache)                               │
│  90+ tables: income_statements, balance_sheets, insider_trades, etc.    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          v1 API ENDPOINTS                                │
│  Cache-first → Paid API fallback (auto-cache) → Free forever            │
└─────────────────────────────────────────────────────────────────────────┘
```

## STARTUP CHECKLIST

When starting a session, always check:

```bash
# 1. Check scraper health
curl https://lician.com/api/monitoring/scraper-status

# 2. If critical issues, investigate cron job logs
# 3. Manually trigger failing syncs if needed
```

## CRON JOBS

| Endpoint | Schedule | What it does |
|----------|----------|--------------|
| `/api/cron/sync-financials?mode=continue&limit=500` | 3x hourly | Syncs SEC EDGAR financials (36,000 stocks/day) |
| `/api/cron/sync-financials?mode=priority&limit=200` | Every 2h | Refreshes top stocks |
| `/api/cron/sync-prices?limit=200` | Every 10min (market hours) | EODHD batch + Yahoo fallback |
| `/api/cron/sync-insider-trades?limit=100` | Hourly | SEC EDGAR Form 4 |
| `/api/cron/sync-short-volume` | Daily 10pm | FINRA short volume |
| `/api/cron/sync-8k-filings?limit=200` | Hourly | SEC EDGAR material events |
| `/api/cron/sync-analyst-estimates?limit=30` | Daily 5am | Yahoo Finance scraping |
| `/api/monitoring/scraper-status` | Daily 7am | Health check dashboard |

## KEY FILES

### Cron Jobs
- `src/app/api/cron/sync-financials/route.ts` - SEC EDGAR financials
- `src/app/api/cron/sync-prices/route.ts` - EODHD + Yahoo prices
- `src/app/api/cron/sync-insider-trades/route.ts` - Form 4 insider trades
- `src/app/api/cron/sync-analyst-estimates/route.ts` - Yahoo scraping
- `src/app/api/cron/sync-short-volume/route.ts` - FINRA data
- `src/app/api/cron/sync-8k-filings/route.ts` - SEC material events

### SEC EDGAR Integration
- `src/lib/sec-edgar/client.ts` - SEC API client with rate limiting
- `src/lib/sec-edgar/sync.ts` - Orchestrates data sync to Supabase
- `src/lib/sec-edgar/financial-parser.ts` - XBRL to normalized format

### Shared Utilities
- `src/lib/cron-utils.ts` - Retry logic, rate limiting, logging

### v1 API (FinancialDatasets-compatible)
- `src/app/api/v1/financials/income-statements/route.ts`
- `src/app/api/v1/financials/balance-sheets/route.ts`
- `src/app/api/v1/financials/cash-flow-statements/route.ts`
- `src/app/api/v1/insider-trades/route.ts`
- `src/app/api/v1/institutional-ownership/route.ts`
- `src/app/api/v1/prices/snapshot/route.ts`

### Monitoring
- `src/app/api/monitoring/scraper-status/route.ts` - Health dashboard

## DATABASE TABLES

Key tables in Supabase:
- `income_statements` - Quarterly/annual income data
- `balance_sheets` - Assets, liabilities, equity
- `cash_flow_statements` - Operating, investing, financing
- `insider_trades` - Form 4 transactions
- `institutional_holdings` - 13F holdings
- `stock_prices_snapshot` - Latest prices
- `analyst_estimates` - EPS/revenue estimates
- `short_volume` - Daily short volume
- `sec_filings` - 8-K, 10-K, 10-Q filings
- `cron_job_log` - Sync history

## TROUBLESHOOTING

### Prices not saving
Check column names match table schema in `supabase/migrations/20251210000003_prices_news.sql`

### Financials not syncing
1. Check SEC rate limit (10 req/sec)
2. Verify XBRL parsing in `financial-parser.ts`
3. Check for UNIQUE constraint violations

### Cron jobs not running
1. Check Vercel cron logs
2. Check Supabase pg_cron status: `SELECT * FROM cron_job_status`
3. Manually trigger: `curl https://lician.com/api/cron/[job-name]`

## FUTURE: EU MARKETS

Plan to expand beyond US:
- London Stock Exchange (LSE)
- Frankfurt (XETRA)
- Paris (Euronext)
- Other EU exchanges

Will need:
- New data sources for EU financials
- ISIN/CUSIP mapping
- Currency conversion
- Different reporting standards (IFRS vs GAAP)

## DATA FLOW STRATEGY

```
1. Supabase cache FIRST (free)
2. Paid API fallback ONLY if missing
3. Auto-cache paid results → free forever
4. Scrapers run continuously to minimize fallback usage
```

Goal: **Zero paid API calls** once all stocks are synced.

---

# AUTONOMOUS RESEARCH AGENT

## Overview

The main page (lician.com) features a **Dexter-inspired autonomous research agent** with a **Morphic-style UI**. See full docs: `docs/AUTONOMOUS_AGENT.md`

## Quick Reference

### Architecture
- **5-Phase Workflow**: Understand → Plan → Execute → Reflect → Answer
- **Multi-Model**: Vercel AI Gateway (GPT-4o, Claude, Llama, Gemini)
- **21 Tools**: Supabase (11) + Financial Datasets API (5) + Firecrawl (5)

### Key Files
```
src/lib/ai/agent/
├── orchestrator.ts    # Main Agent class with 5-phase workflow
├── prompts.ts         # System prompts for each phase
├── types.ts           # TypeScript types and Zod schemas
└── index.ts           # Public exports

src/lib/ai/
├── tools.ts           # All 21 financial tools
└── financial-datasets-api.ts  # API fallback client

src/app/api/chat/
├── autonomous/route.ts  # Streaming agent API
└── public/route.ts      # Basic chat API

src/components/
└── AutonomousChat.tsx   # Morphic-style UI
```

### Tools Available

**Supabase Data (11):**
getStockQuote, getCompanyFundamentals, getFinancialStatements, getInsiderTrades, getInstitutionalOwnership, getAnalystRatings, getShortInterest, getBiotechCatalysts, searchStocks, getMarketMovers, compareStocks

**Financial Datasets API (5):**
getSECFilings, getPriceHistory, getFinancialNews, getSegmentedRevenue, getAnalystEstimates

**Firecrawl Web Research (5):**
- `deepResearch` - Autonomous multi-source research
- `extractFinancialData` - Schema-based extraction from IR pages
- `searchRecentNews` - Time-filtered news (day/week/month/year)
- `firecrawlAgent` - Autonomous data discovery without URLs
- `crawlInvestorRelations` - Full IR website crawl

### API Usage

```bash
# Get available models
curl https://lician.com/api/chat/autonomous

# Research query
curl -X POST https://lician.com/api/chat/autonomous \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Apple Q3 revenue?","model":"gpt-4o-mini","stream":false}'
```

### Environment Variables
```bash
AI_GATEWAY_API_KEY=vck_...        # Vercel AI Gateway
FIRECRAWL_API_KEY=fc-...          # Firecrawl web research
FINANCIAL_DATASETS_API_KEY=...    # Fallback API
```

### Rate Limits
- 10 requests/hour per IP
- Max 3 iterations per query
- 120 second timeout
