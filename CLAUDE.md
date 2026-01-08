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

## EU MARKETS - IMPLEMENTED (Jan 2026)

European financial data infrastructure is now live with support for Sweden, Norway, UK, and more.

### EU Data Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EUROPEAN DATA SOURCES                               │
├────────────────┬────────────────┬────────────────┬──────────────────────┤
│    SWEDEN      │    NORWAY      │      UK        │    FUTURE            │
│  Allabolag.se  │  Brreg (FREE!) │ Companies House│  Denmark (CVR)       │
│  (scraping)    │  Regnskaps-    │ (FREE API)     │  Finland (PRH)       │
│                │  registeret    │ Bulk XBRL      │  Germany (Bundesanz) │
│                │  (FREE!)       │ (FREE)         │                      │
└───────┬────────┴───────┬────────┴───────┬────────┴──────────────────────┘
        │                │                │
        ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EU CRON JOBS (Vercel)                                │
│  sync-swedish-companies | sync-norwegian-companies | sync-uk-companies   │
│  sync-norwegian-financials | sync-uk-financials                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EU TABLES (IFRS Format)                      │
│  eu_companies | eu_income_statements | eu_balance_sheets                 │
│  eu_cash_flow_statements | eu_financial_metrics | eu_sync_log            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI TOOLS                                         │
│  searchEUCompanies | getEUCompanyDetails | getEUFinancialStatements     │
│  compareEUCompanies                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### EU Cron Jobs

| Endpoint | Country | Data Type | API Key Required | Status |
|----------|---------|-----------|------------------|--------|
| `/api/cron/sync-swedish-companies` | Sweden | Company profiles | No (scraping) | ⚠️ Blocked |
| `/api/cron/sync-norwegian-companies` | Norway | Company profiles | **No** | ✅ Working |
| `/api/cron/sync-norwegian-financials` | Norway | Full financials | **No** | ✅ Working |
| `/api/cron/sync-uk-companies` | UK | Company profiles | Yes (free) | ✅ Working |
| `/api/cron/sync-uk-financials` | UK | Filing history | Yes (free) | ✅ Working |
| `/api/cron/sync-financial-metrics` | US | PE, market cap | No | ⚠️ Yahoo auth issue |

### EU Database Tables

Created in migration `20260108000002_eu_companies_schema.sql`:

```sql
-- Company master data for all EU countries
eu_companies (
  org_number, country_code, name, legal_form,
  industry_code, employees, revenue_latest,
  ticker, exchange, isin, is_listed
)

-- IFRS format income statements
eu_income_statements (
  org_number, country_code, report_period, fiscal_year,
  revenue, operating_profit, profit_before_tax,
  finance_income, finance_costs, profit_for_the_year
)

-- IFRS format balance sheets
eu_balance_sheets (
  org_number, country_code, report_period, fiscal_year,
  total_assets, non_current_assets, current_assets,
  total_equity, total_liabilities
)

-- Cash flow statements
eu_cash_flow_statements (...)

-- Calculated metrics
eu_financial_metrics (...)

-- Sync tracking
eu_sync_log (source, country_code, status, companies_synced)
```

### EU AI Tools

Added to `src/lib/ai/tools.ts`:

```typescript
// Search EU companies by name or country
searchEUCompanies({ query?: string, country?: 'SE'|'NO'|'GB'|'DE'|'FR', limit?: number })

// Get company details
getEUCompanyDetails({ name?: string, orgNumber?: string, country?: string })

// Get financial statements
getEUFinancialStatements({ name?: string, statementType: 'income'|'balance'|'both' })

// Compare companies
compareEUCompanies({ companies: ['Volvo', 'BMW', 'Mercedes'] })
```

### EU Data Sources Detail

#### Norway (100% FREE, No API Key!)

**Brreg - Company Registry**
- API: `https://data.brreg.no/enhetsregisteret/api`
- 1.1+ million Norwegian companies
- Data: name, org form, address, industry, employees

**Regnskapsregisteret - Financial Statements**
- API: `https://data.brreg.no/regnskapsregisteret/regnskap/{orgNumber}`
- Full income statements & balance sheets
- Returns last fiscal year's audited accounts
- Sample: Equinor (923609016) - $72.5B revenue, $8.1B net income

#### UK (FREE with API Key)

**Companies House API**
- API: `https://api.company-information.service.gov.uk`
- Get free API key: https://developer.company-information.service.gov.uk/
- 4.5+ million UK companies
- Filing history, accounts due dates

**Companies House Bulk Data (FREE XBRL)**
- Daily: https://download.companieshouse.gov.uk/en_accountsdata.html
- Monthly: https://download.companieshouse.gov.uk/en_monthlyaccountsdata.html
- Full financial statements in iXBRL format
- ~100MB/day, ~1GB/month

#### Sweden (Scraping - Currently Blocked)

**Allabolag.se**
- ~1.2 million Swedish companies
- Revenue, profit, employees, industry
- Currently blocked - needs proxy or alternative approach

### Pre-loaded Companies

**Norway (sync-norwegian-companies):**
```
Equinor, DNB, Telenor, Norsk Hydro, Orkla, Yara, Mowi,
Aker BP, Kongsberg, Storebrand, Subsea 7, Schibsted,
SalMar, Veidekke, Norwegian Air, Kahoot, AutoStore
```

**UK (sync-uk-companies):**
```
Shell, Unilever, HSBC, BP, Barclays, BAE Systems, GSK,
AstraZeneca, Rio Tinto, Rolls-Royce, Diageo, BT, Lloyds,
Aviva, RELX, National Grid, Tesco, Sainsbury, M&S,
Arm Holdings, Wise, Deliveroo, Revolut, Monzo, Starling
```

**Sweden (sync-swedish-companies):**
```
Volvo, Ericsson, H&M, SEB, Nordea, Atlas Copco, Spotify,
Klarna, SKF, Sandvik, Essity, Electrolux, Handelsbanken,
Swedbank, Sinch, Telia, EQT, Investor, IKEA, Northvolt
```

### Known Issues & Fixes Needed

| Issue | Source | Status | Fix Needed |
|-------|--------|--------|------------|
| Scraping blocked | Allabolag.se | ⚠️ | Use proxy or official API |
| Yahoo crumb auth | Yahoo Finance | ⚠️ | Implement cookie/crumb flow |
| UK API key | Companies House | Config | Add `COMPANIES_HOUSE_API_KEY` env var |

### Environment Variables for EU

```bash
# UK Companies House (get free from gov.uk)
COMPANIES_HOUSE_API_KEY=your_key_here

# Norwegian APIs - NO KEY REQUIRED!
# Swedish - NO KEY REQUIRED (scraping)
```

### Testing EU Endpoints

```bash
# Test Norwegian companies (FREE, no key!)
curl https://lician.com/api/cron/sync-norwegian-companies?limit=5

# Test Norwegian financials (FREE, no key!)
curl https://lician.com/api/cron/sync-norwegian-financials?org=923609016

# Test UK companies (needs API key)
curl https://lician.com/api/cron/sync-uk-companies?company=00102498

# Sync batch of Norwegian financials
curl https://lician.com/api/cron/sync-norwegian-financials?limit=15
```

### Sample Data: Equinor (Norway)

```json
{
  "orgNumber": "923609016",
  "year": 2024,
  "currency": "USD",
  "financials": {
    "revenue": 72543000000,
    "operatingProfit": 10347000000,
    "netIncome": 8141000000,
    "totalAssets": 109150000000,
    "equity": 41090000000
  }
}
```

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

---

# SEC BULK DATA IMPORT (Jan 8, 2026)

## Overview

Successfully imported bulk financial data from SEC EDGAR for 5,344 US companies.

## Data Imported

| Table | Records | Tickers |
|-------|---------|---------|
| `income_statements` | 313,899 | 5,344 |
| `balance_sheets` | 302,137 | ~5,344 |
| `cash_flow_statements` | 223,315 | ~5,344 |
| `company_fundamentals` | 139,584 | ✓ |

## Import Script

Located at: `scripts/process-sec-bulk.ts`

```bash
# Run bulk import
npx tsx scripts/process-sec-bulk.ts
```

**Key features:**
- Downloads SEC EDGAR bulk JSON files
- Parses US-GAAP XBRL into normalized format
- Maps CIK to ticker using SEC company tickers JSON
- Handles rate limiting and batch inserts
- Uses service role key for RLS bypass

## Data Quality Notes

- 19,063 SEC files processed
- 5,344 companies had usable US-GAAP data
- ~14,000 were foreign filers (IFRS), shell companies, or no standard financials
- Complete ticker coverage from A-Z (AAPL to ZS)

## Tables Still Empty

| Table | Status | Fix |
|-------|--------|-----|
| `financial_metrics` | Empty | Run `/api/cron/sync-financial-metrics` (needs Yahoo fix) |
| `analyst_estimates` | 15 records | Run `/api/cron/sync-analyst-estimates` |

---

# DEVELOPMENT LOG (Jan 8, 2026)

## Morning Session: SEC Bulk Import + Homepage Redesign

1. **Stock price sync debugging** - Fixed data not persisting to database
2. **SEC bulk import** - Imported 839,351 financial records for 5,344 companies
3. **Homepage redesign** - Added market movers widget, portfolio quick actions
4. **Header updates** - Added search icon and portfolio connect button

## Afternoon Session: EU Financial Data Infrastructure

Built complete European financial data pipeline:

### Files Created

```
src/app/api/cron/
├── sync-financial-metrics/route.ts    # US metrics from Yahoo (needs fix)
├── sync-swedish-companies/route.ts    # Allabolag.se scraper (blocked)
├── sync-norwegian-companies/route.ts  # Brreg API (working!)
├── sync-norwegian-financials/route.ts # Regnskapsregisteret (working!)
├── sync-uk-companies/route.ts         # Companies House API
└── sync-uk-financials/route.ts        # Companies House filings

supabase/migrations/
├── 20260108000001_add_financial_metrics_ticker_constraint.sql
└── 20260108000002_eu_companies_schema.sql

src/lib/ai/tools.ts  # Added 4 EU company tools
```

### Commits

```
605b3dc1 feat: Add EU financial data infrastructure for Sweden, Norway, UK
3f665e94 fix: Norwegian financials API parsing for correct field names
```

### Data Synced

- 4 Norwegian companies in `eu_companies`
- 5 Norwegian companies with full financials in `eu_income_statements` and `eu_balance_sheets`
- Sample: Equinor - $72.5B revenue, $8.1B net income

### What's Working

- Norwegian company sync (FREE, no API key)
- Norwegian financials sync (FREE, no API key)
- EU database schema deployed
- AI tools for EU company queries

### What Needs Fixing

1. **Swedish scraper** - Allabolag.se blocking requests
2. **US financial_metrics** - Yahoo Finance now requires auth crumb
3. **UK Companies House** - Need to add `COMPANIES_HOUSE_API_KEY` to Vercel env

---

# AI TOOLS SUMMARY

## US Company Tools (11)
```
getStockQuote, getCompanyFundamentals, getFinancialStatements,
getInsiderTrades, getInstitutionalOwnership, getAnalystRatings,
getShortInterest, getBiotechCatalysts, searchStocks,
getMarketMovers, compareStocks
```

## EU Company Tools (4) - NEW
```
searchEUCompanies, getEUCompanyDetails,
getEUFinancialStatements, compareEUCompanies
```

## External API Tools (5)
```
getSECFilings, getPriceHistory, getFinancialNews,
getSegmentedRevenue, getAnalystEstimates
```

## Web Research Tools (5)
```
deepResearch, extractFinancialData, searchRecentNews,
firecrawlAgent, crawlInvestorRelations
```

**Total: 25 tools** available to the autonomous research agent
