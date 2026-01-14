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

# ANALYTICS & TRACKING (Jan 2026)

## Overview

Lician has comprehensive analytics tracking across 4 platforms for understanding user behavior, conversions, and product performance.

## Active Analytics Tools

| Tool | Purpose | Dashboard | Status |
|------|---------|-----------|--------|
| **Google Analytics 4** | Traffic, events, conversions | [analytics.google.com](https://analytics.google.com) | ✅ Live |
| **PostHog** | Product analytics, session recordings, funnels | [us.posthog.com](https://us.posthog.com) | ✅ Live |
| **Microsoft Clarity** | Heatmaps, session recordings (FREE) | [clarity.microsoft.com](https://clarity.microsoft.com) | 🔧 Needs key |
| **Vercel Analytics** | Web vitals, performance | Vercel dashboard | ✅ Live |

## Environment Variables

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-K6Q0QJYRET

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_Lh6vWcv4IAs0GR9wRdRndaibta2Wbgcn3ls1wHUb7Lt
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Microsoft Clarity (add when available)
NEXT_PUBLIC_CLARITY_PROJECT_ID=<get from clarity.microsoft.com>
```

## Key Files

### Analytics Library
- `src/lib/analytics.ts` - 25+ tracking functions for GA4
- `src/hooks/useAnalytics.ts` - React hook for components
- `src/instrumentation-client.ts` - PostHog initialization (Next.js 15.3+)
- `src/components/PostHogProvider.tsx` - PostHog React context

### Integration Points
- `src/app/layout.tsx` - GA4 + Clarity scripts, PostHog provider
- `src/components/ManusStyleHome.tsx` - AI query tracking, CTA tracking
- `src/app/premium/success/page.tsx` - Purchase conversion tracking

## What's Tracked

### Google Analytics 4 Events

| Event | When | Properties |
|-------|------|------------|
| `ai_query_start` | User submits AI query | query, model, model_tier |
| `ai_query_complete` | AI responds | response_time_ms, success, tools_used |
| `begin_checkout` | User clicks upgrade | plan, value |
| `purchase` | Subscription complete | transaction_id, plan, value |
| `upgrade_prompt_shown` | Auth/payment modal shown | trigger |
| `cta_click` | Button clicked | cta_name, location |
| `scroll` | Scroll milestones | percent_scrolled (25/50/75/100) |

### PostHog Auto-Capture

PostHog automatically captures:
- All page views (SPA-aware)
- All clicks with element data
- Form submissions
- Session recordings (video replay)
- User identification when logged in

### Custom Dimensions (GA4)

| Dimension | Values |
|-----------|--------|
| `user_type` | anonymous, authenticated, premium |
| `subscription_tier` | free, monthly, annual |
| `model_used` | gemini-flash, gpt-4o-mini, claude-sonnet-4, etc. |

### Content Groups (GA4)

Pages are auto-grouped:
- `Stock Pages` - /stock/*
- `Compare Pages` - /compare/*
- `Sector Pages` - /sectors/*
- `Learn Pages` - /learn/*
- `Homepage` - /
- `Other` - everything else

## Usage in Components

### Track AI Query
```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackAIQueryStart, trackAIQueryComplete } = useAnalytics()

  const handleQuery = async () => {
    trackAIQueryStart({ query, model, model_tier: 'standard' })
    const start = Date.now()
    // ... execute query
    trackAIQueryComplete({
      query, model, model_tier: 'standard',
      response_time_ms: Date.now() - start,
      success: true
    })
  }
}
```

### Track CTA Click
```typescript
const { trackCTAClick, trackBeginCheckout } = useAnalytics()

<button onClick={() => {
  trackCTAClick('upgrade_button', 'header')
  trackBeginCheckout('annual', 58)
}}>
  Upgrade
</button>
```

### Identify User (PostHog)
```typescript
import { identifyUser } from '@/components/PostHogProvider'

// When user logs in
identifyUser(user.id, {
  email: user.email,
  is_premium: true,
  plan: 'annual'
})
```

### Track Custom PostHog Event
```typescript
import { trackPostHogEvent } from '@/components/PostHogProvider'

trackPostHogEvent('feature_used', {
  feature: 'dcf_calculator',
  ticker: 'AAPL'
})
```

## Dashboards & What to Look For

### Google Analytics
- **Acquisition** → Where users come from
- **Engagement** → Which pages, how long
- **Monetization** → Revenue, conversion funnels
- **Events** → Custom event counts and trends

### PostHog
- **Session Recordings** → Watch users interact with AI chat
- **Funnels** → homepage → signup → premium conversion
- **Trends** → Event counts over time
- **Feature Flags** → A/B test new features

### Microsoft Clarity (when enabled)
- **Heatmaps** → Where users click/scroll
- **Rage Clicks** → Frustration indicators
- **Dead Clicks** → Broken elements
- **Session Recordings** → Free unlimited replays

## Troubleshooting

### Events not appearing in GA4
1. Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
2. GA4 has 24-48h delay for some reports
3. Use Realtime report for immediate verification

### PostHog not recording
1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Visit site in browser (not curl)
3. Check PostHog dashboard → Activity

### Add new tracking
1. Add function to `src/lib/analytics.ts`
2. Export from `src/hooks/useAnalytics.ts`
3. Import and call in component

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

## EU MARKETS - FULLY OPERATIONAL (Jan 2026)

European financial data infrastructure is **production-ready** with **106,975 companies** and **48,592 financials** synced from FREE government APIs.

### Current Database Counts (Verified Jan 8, 2026)

| Table | Records | Coverage |
|-------|---------|----------|
| `eu_companies` | **106,975** | Norway, Denmark, Finland, Sweden |
| `eu_income_statements` | **48,592** | Full IFRS format financials |
| `eu_balance_sheets` | **48,592** | Full IFRS format financials |

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
| `/api/cron/sync-norwegian-companies` | Norway | 106K+ company profiles | **No** | ✅ Working |
| `/api/cron/sync-norwegian-financials` | Norway | 48K+ full financials | **No** | ✅ Working |
| `/api/cron/sync-danish-companies` | Denmark | Company + financials | **No** | ✅ Working |
| `/api/cron/sync-finnish-companies` | Finland | Company profiles | **No** | ✅ Working |
| `/api/cron/sync-swedish-stocks` | Sweden | 38 listed stocks | **No** | ✅ Working |
| `/api/cron/sync-german-companies` | Germany | 5M available | **No** | 🔧 API recovering |

### Bulk Sync Mode (Norwegian)

The Norwegian sync supports a bulk mode using kommune (municipality) + org form combinations:

```bash
# Trigger bulk sync - cycles through 70 combinations (10 kommuner × 7 org forms)
curl "https://lician.com/api/cron/sync-norwegian-companies?mode=bulk&limit=100&offset=0"

# Available modes: known, as, enk, nuf, sa, da, ans, asa, all, kommune, bulk
# Each combination can return up to 10K companies (Brreg API limit)
```

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

#### Norway (100% FREE, No API Key!) - 106K+ SYNCED

**Brreg - Company Registry**
- API: `https://data.brreg.no/enhetsregisteret/api`
- 1.1+ million Norwegian companies available
- **106,975 companies synced** via bulk mode
- Data: name, org form, address, industry, employees

**Regnskapsregisteret - Financial Statements**
- API: `https://data.brreg.no/regnskapsregisteret/regnskap/{orgNumber}`
- **48,592 financial statements synced**
- Full income statements & balance sheets (IFRS format)
- ~45% of companies have published financials

#### Denmark (100% FREE, No API Key!)

**CVR - Central Business Register**
- Financials endpoint: `http://distribution.virk.dk/offentliggoerelser/_search`
- 2.2+ million Danish companies available
- **No authentication required for financials!**
- Full income statements and balance sheets

#### Finland (100% FREE, No API Key!)

**PRH - Patent and Registration Office**
- API: `https://avoindata.prh.fi/opendata-ytj-api/v3`
- 600K+ Finnish companies available
- Company form codes: OY (private), OYJ (public), KY, AY, OK

#### Sweden (Yahoo Finance)

**Yahoo Finance v8 API**
- Endpoint: `https://query2.finance.yahoo.com/v8/finance/chart/{ticker}`
- 38 listed Swedish stocks (OMXS30 + extras)
- Real-time prices and historical data

#### Germany (5M companies - API temporarily down)

**OffeneRegister.de**
- API: `https://db.offeneregister.de/openregister.json`
- 5+ million German companies
- Datasette SQL API
- Currently returning 502 - check periodically

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
2. **US financial_metrics** - ✅ FIXED - Now uses EODHD API (Jan 14, 2026)
3. **UK Companies House** - Need to add `COMPANIES_HOUSE_API_KEY` to Vercel env

---

# DEVELOPMENT LOG (Jan 14, 2026 - Evening Session)

## Issues Found and Fixed

### 1. EODHD API Daily Limit Exceeded

**Problem**: The search API and AI tools were failing because EODHD API hit its daily limit. The `/api/search` route was returning `{"results":[],"error":"Search failed"}`.

**Root Cause**: Search route used EODHD as primary source, not Supabase.

**Fix**: Updated `/api/search/route.ts` to use Supabase `company_fundamentals` (141k+ companies) as primary source:

```typescript
// Strategy 1: Search Supabase company_fundamentals (primary)
const { data } = await getSupabase()
  .from('company_fundamentals')
  .select('symbol, company_name, sector, industry, market_cap, exchange_code')
  .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%,...`)
  .order('market_cap', { ascending: false })
  .limit(limit)

// Strategy 2: Fallback to income_statements tickers
// Strategy 3: EODHD API (only if Supabase returns nothing)
```

**Commit**: `6dbb8d12 fix: Use Supabase as primary search source instead of EODHD`

### 2. Wrong Field Names in AI Tools

**Problem**: `getCompanyFundamentalsTool` returned null PE ratios even though data existed.

**Root Cause**: Tool was using `m.pe_ratio` but database column is `price_to_earnings_ratio`.

**Fix**: Updated field mappings in `src/lib/ai/tools.ts`:

```typescript
// Before (wrong)
pe_ratio: m.pe_ratio,
pb_ratio: m.pb_ratio,

// After (correct)
pe_ratio: m.price_to_earnings_ratio,
pb_ratio: m.price_to_book_ratio,
ps_ratio: m.price_to_sales_ratio,
ev_ebitda: m.enterprise_value_to_ebitda_ratio,
```

**Commit**: `2180bee1 fix: Use correct field names for financial_metrics in AI tools`

### 3. AI Not Passing Ticker Args to Tools

**Problem**: Gemini Flash was selecting correct tools but passing empty args: `{"toolName":"getStockQuote","args":{}}` causing "Cannot read properties of undefined (reading 'toUpperCase')" errors.

**Root Cause**: The AI model wasn't extracting tickers from the entities and including them in tool args.

**Fix**: Added auto-populate fallback in `src/lib/ai/agent/orchestrator.ts`:

```typescript
private async selectTools(task: Task): Promise<ToolCall[]> {
  // Extract ticker from entities for fallback
  const tickerEntity = this.state!.understanding!.entities.find(e => e.type === 'ticker')
  const fallbackTicker = tickerEntity?.normalized || tickerEntity?.value

  // ... AI generates tool selections ...

  return object.map((s, i) => {
    // Auto-populate ticker if args is empty and we have a ticker entity
    let args = s.args as Record<string, unknown>
    if (fallbackTicker && (!args || Object.keys(args).length === 0)) {
      args = { ticker: fallbackTicker }
    }
    // ...
  })
}
```

Also improved `TOOL_SELECTION_SYSTEM_PROMPT` with explicit examples.

**Commit**: `b389221d fix: Auto-populate ticker args from entities when AI returns empty args`

## Test Results After Fixes

| Query | Status | Result |
|-------|--------|--------|
| "What is NVDA market cap?" | ✅ Working | $4.5T, PE 45.89, margins, growth rates |
| "What is AAPL PE ratio?" | ✅ Working | PE 34.84, Market cap $3.85T |
| Search "technology" | ✅ Working | NVDA, AAPL from Supabase |

## API Updates Research (2026)

| API | Changes | Notes |
|-----|---------|-------|
| **EODHD** | No major changes | Python library updated Jan 10, 2026 |
| **SEC EDGAR** | Same endpoints | 10 req/sec limit, bulk ZIP files available |
| **Yahoo Finance** | Broken | Requires cookie+crumb auth since late 2024 |

## Known Limitations

1. **EODHD Daily Limit**: Free tier has ~100k requests/day. When exceeded, search falls back to Supabase.
2. **Vercel AI Gateway Rate Limits**: Free tier can hit limits during heavy usage, causing reflect/answer phases to fail.
3. **Yahoo Finance**: Direct API calls fail - use EODHD for real-time quotes instead.

## Files Modified

```
src/app/api/search/route.ts          # Supabase-first search
src/lib/ai/tools.ts                  # Correct field mappings
src/lib/ai/agent/orchestrator.ts     # Auto-populate ticker args
src/lib/ai/agent/prompts.ts          # Better tool selection prompts
```

---

# AI AGENT ARCHITECTURE (Jan 14, 2026)

## Overview

Lician's AI agent is inspired by [virattt/dexter](https://github.com/virattt/dexter) - an autonomous financial research agent. Our implementation uses the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) with multi-model support via [Vercel AI Gateway](https://vercel.com/docs/ai-sdk).

## Current Architecture

### 5-Phase Workflow (Dexter-Inspired)

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

### Key Files

```
src/lib/ai/agent/
├── orchestrator.ts    # Agent class with 5-phase workflow
├── prompts.ts         # System prompts for each phase
├── types.ts           # TypeScript types and state management
└── index.ts           # Public exports

src/lib/ai/
├── tools.ts           # 25 financial tools (Supabase + APIs)
└── financial-datasets-api.ts  # Fallback API client

src/app/api/chat/autonomous/route.ts  # API endpoint
```

### Available Models (Vercel AI Gateway)

| Model | ID | Tier | Best For |
|-------|-----|------|----------|
| Gemini Flash | `google/gemini-2.0-flash` | Fast | Simple queries, low latency |
| GPT-4o Mini | `openai/gpt-4o-mini` | Standard | Balanced cost/quality |
| Claude 3.5 Sonnet | `anthropic/claude-3-5-sonnet` | Standard | Complex reasoning |
| Llama 3.3 70B | `meta/llama-3.3-70b` | Standard | Open-source alternative |
| GPT-4o | `openai/gpt-4o` | Premium | Best reasoning |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Premium | Best analysis |

### Tool Categories

**Supabase Data Tools (11):**
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

**External API Tools (5):**
```typescript
getSECFilings          // 10-K, 10-Q, 8-K filings
getPriceHistory        // Historical prices
getFinancialNews       // News articles
getSegmentedRevenue    // Business segment breakdown
getAnalystEstimates    // EPS/revenue estimates
```

**Firecrawl Web Research Tools (5):**
```typescript
deepResearch           // Multi-source autonomous research
extractFinancialData   // Schema-based extraction from IR pages
searchRecentNews       // Time-filtered news search
firecrawlAgent         // Autonomous data discovery
crawlInvestorRelations // Full IR website crawl
```

**EU Company Tools (4):**
```typescript
searchEUCompanies      // 106k+ European companies
getEUCompanyDetails    // Company info by org number
getEUFinancialStatements // IFRS format financials
compareEUCompanies     // Cross-country comparison
```

## Comparison with Dexter

| Feature | Dexter | Lician | Gap |
|---------|--------|--------|-----|
| **Multi-Agent** | 4 agents (Plan, Action, Validate, Answer) | 1 agent with 5 phases | Similar |
| **Tool Selection** | Just-in-time with gpt-4-mini | Just-in-time with any model | ✅ Same |
| **Validation** | "DEFAULT TO COMPLETE" logic | Reflect phase with criteria | Need improvement |
| **Data Source** | Financial Datasets API only | Supabase + fallback APIs | ✅ Better |
| **Loop Detection** | Built-in step limits | maxIterations config | ✅ Same |
| **Streaming** | Terminal UI (Ink) | SSE for web UI | ✅ Same |
| **Entity Extraction** | Ticker normalization | Company→ticker mapping | ✅ Same |

## Improvement Roadmap

### Priority 1: Smarter Validation (Dexter's "DEFAULT TO COMPLETE")

**Current Issue**: Our reflect phase is too aggressive, often requesting more data when it's unnecessary.

**Dexter's Approach**: Only mark incomplete when "critical primary entity data is ENTIRELY missing."

**Fix**: Update `REFLECT_SYSTEM_PROMPT` to:
```typescript
DEFAULT TO COMPLETE unless:
- Primary ticker data completely missing (not just one metric)
- User explicitly asked for something we couldn't retrieve
- Critical calculation failed entirely

DO NOT mark incomplete for:
- Missing optional metrics (dividend yield, beta)
- Partial historical data
- Missing comparison data when single stock was asked
```

### Priority 2: Better Tool Result Handling (AI SDK 6)

**Current Issue**: Large tool results waste tokens when sent back to model.

**Solution**: Use `toModelOutput` from AI SDK 6 to separate tool results from model context:
```typescript
// Instead of returning full data
return { success: true, data: largeObject }

// Return summarized version for model
return {
  success: true,
  data: largeObject,
  toModelOutput: () => ({
    summary: "AAPL PE: 34.84, Market Cap: $3.85T",
    hasData: true
  })
}
```

### Priority 3: Firecrawl Deep Research Integration

**Current Issue**: Firecrawl tools exist but aren't used intelligently.

**Enhancement**: Add logic to trigger Firecrawl when:
1. Query asks about recent news/events not in our database
2. Supabase data is stale (>30 days old)
3. User asks about private companies or non-US stocks we don't cover
4. Query requires real-time information (earnings calls, press releases)

### Priority 4: Smarter Model Routing

**Current Issue**: Same model used for all phases.

**Dexter's Approach**: Uses `gpt-4-mini` for tool selection (fast/cheap) and main model for reasoning.

**Enhancement**:
```typescript
// Use fast model for mechanical tasks
const fastModel = gateway('google/gemini-2.0-flash')  // Tool selection
const reasoningModel = gateway('openai/gpt-4o-mini')   // Planning, answering

// In selectTools()
const { object } = await generateObject({
  model: this.fastModel,  // Cheap and fast
  schema: ToolSelectionSchema,
  ...
})

// In answerPhase()
const { text } = await generateText({
  model: this.model,  // Better reasoning
  ...
})
```

### Priority 5: Context Window Optimization

**Current Issue**: Sending entire conversation history to each phase.

**Enhancement**: Implement context selection like Dexter:
```typescript
// Add CONTEXT_SELECTION phase
const relevantContext = await selectRelevantContext(
  query,
  taskResults,
  conversationHistory
)

// Only send relevant results to answer phase
const answer = await generateAnswer(relevantContext)
```

### Priority 6: Message Summarization

**Current Issue**: Long conversations bloat context.

**Enhancement**: Add message summarization for long conversations:
```typescript
if (conversationHistory.length > 10) {
  const summary = await summarizeMessages(conversationHistory.slice(0, -4))
  conversationHistory = [
    { role: 'system', content: `Previous context: ${summary}` },
    ...conversationHistory.slice(-4)
  ]
}
```

## Environment Variables

```bash
# Vercel AI Gateway (required)
AI_GATEWAY_API_KEY=vck_...

# Firecrawl (for web research)
FIRECRAWL_API_KEY=fc-...

# Financial Datasets API (fallback)
FINANCIAL_DATASETS_API_KEY=...

# Supabase (primary data source)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Vercel AI Gateway (Free) | Limited | Subject to abuse prevention |
| EODHD API | ~100k/day | Affects search, quotes |
| Firecrawl | 1k credits/month | $16/month for more |
| Financial Datasets | Pay per call | Fallback only |

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
- [Firecrawl Deep Research](https://www.firecrawl.dev/use-cases/deep-research)

---

# DATA ARCHITECTURE: US vs EU (Decision Log)

## Current State (Jan 14, 2026)

**US and EU data use SEPARATE schemas** - this is intentional.

### Why Separate Schemas?

| Aspect | US Tables | EU Tables |
|--------|-----------|-----------|
| **Accounting Standard** | US-GAAP | IFRS |
| **Company Identifier** | `cik` (SEC) + `ticker` | `org_number` + `country_code` |
| **Net Income Field** | `net_income` | `profit_for_the_year` |
| **Operating Income** | `operating_income` | `operating_profit` |
| **Cost Field** | `cost_of_revenue` | `cost_of_sales` |
| **Tables** | `income_statements`, `balance_sheets`, `cash_flow_statements` | `eu_income_statements`, `eu_balance_sheets`, `eu_cash_flow_statements` |

### Data Coverage (Jan 14, 2026)

**US Data:**
| Table | Records | Companies |
|-------|---------|-----------|
| `income_statements` | 313,902 | 5,345 |
| `balance_sheets` | 302,139 | ~5,345 |
| `cash_flow_statements` | 223,317 | ~5,345 |
| `financial_metrics` | 4,100 | 4,100 |
| **Total** | **839,358** | **5,345 unique** |

**EU Data:**
| Table | Records | Countries |
|-------|---------|-----------|
| `eu_companies` | 106,975 | NO, FI, SE |
| `eu_income_statements` | 48,592 | NO |
| `eu_balance_sheets` | 48,592 | NO |

### Future Decision: Unified View vs Separate

**Options:**
1. **Keep Separate (Current)** - More accurate, respects US-GAAP vs IFRS differences
2. **Create Unified View** - Map common fields (`revenue`, `net_income_normalized`) for AI queries
3. **Smart AI Routing** - AI detects company region and queries appropriate table

**Recommendation:** Keep separate for data integrity. Create unified view only if AI query experience suffers.

### SEC Bulk Import Gap

- SEC has **10,303** companies with tickers
- We imported **5,345** companies (52%)
- Gap: ~5,000 companies whose XBRL uses non-standard concept names
- Most missing are: OTC stocks, shell corps, non-standard filers
- Major stocks (S&P 500, NASDAQ-100) are all covered

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

---

# CRITICAL REFERENCES - DO NOT HALLUCINATE

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

---

# EMAIL INFRASTRUCTURE (Jan 2026)

## Overview

Lician uses a multi-provider email system with automatic fallback. **Elastic Email** is the primary provider due to cost ($0.09/1,000 emails).

## Email Providers (Priority Order)

| Provider | Cost | Env Variable | Status |
|----------|------|--------------|--------|
| **Elastic Email** | $0.09/1k | `ELASTIC_EMAIL_API_KEY` | ✅ Primary |
| Brevo | 9k free/month | `BREVO_API_KEY` | Fallback |
| Resend | $0.10/email | `RESEND_API_KEY` | Fallback |

The system auto-detects which provider is configured and uses the first available.

## DNS Records for lician.com (Loopia)

**Configured Jan 14, 2026** - All records verified and saved:

| Record Type | Name | Value | Status |
|-------------|------|-------|--------|
| **SPF** | @ (root) | `v=spf1 a mx include:_spf.google.com -all` | ✅ SAVED |
| **DKIM** | `api._domainkey` | `k=rsa;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4G...` | ✅ SAVED |
| **CNAME** | `tracking` | `api.elasticemail.com` | ✅ SAVED |
| **DMARC** | `_dmarc` | `v=DMARC1;p=none;` | ✅ SAVED |

**DNS Propagation**: 15min-48h for full global propagation.

## Key Files

### Email Service Library
- `src/lib/email.ts` - Multi-provider email service with templates
- `src/types/elasticemail.d.ts` - TypeScript declarations for Elastic Email SDK

### API Endpoints
- `POST /api/email/subscribe` - Newsletter subscription
- `GET /api/email/confirm?token=xxx` - Email confirmation
- `GET /api/cron/send-weekly-digest` - Weekly newsletter (cron)

### Components
- `src/components/NewsletterSignup.tsx` - 3 variants: inline, card, hero

## Database Tables

```sql
-- email_subscribers table (Supabase)
email_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, confirmed, unsubscribed
  source TEXT,                     -- homepage, footer, popup, etc.
  confirmation_token UUID,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  subscribed_weekly_digest BOOLEAN DEFAULT true,
  subscribed_alerts BOOLEAN DEFAULT true,
  emails_sent INT DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

## Email Templates

Three templates available in `src/lib/email.ts`:

1. **Welcome Email** - Sent on subscription with confirmation link
2. **Weekly Digest** - Market movers, insider trades, AI insights
3. **Market Alert** - Price alerts, insider activity, earnings

## Testing Email

```bash
# Trigger welcome email
curl -X POST https://lician.com/api/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "source": "test"}'

# Test weekly digest (add ?test=true for local testing)
curl "https://lician.com/api/cron/send-weekly-digest?test=true"
```

## Cron Setup (Vercel)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/send-weekly-digest",
    "schedule": "0 8 * * 1"
  }]
}
```

Required env var: `CRON_SECRET` for authentication.

## Troubleshooting

### Emails not sending
1. Check DNS propagation: https://mxtoolbox.com/spf.aspx (search `lician.com`)
2. Verify domain in Elastic Email dashboard → Settings → Domains
3. Check Vercel logs for errors

### DNS Verification Tools
- MXToolbox: https://mxtoolbox.com/spf.aspx
- Google Admin Toolbox: toolbox.googleapps.com/apps/checkmx/
- DNSChecker: https://dnschecker.org/

### Provider Fallback
If Elastic Email fails, add `BREVO_API_KEY` or `RESEND_API_KEY` to Vercel env vars as backup.

---

# MOBILE APP - LICIAN (Jan 2026)

## Overview

Lician has a companion mobile app built with **Expo/React Native**. The app provides portfolio tracking, AI insights, and market data on mobile devices.

## App Store Links

| Platform | Bundle ID | Link |
|----------|-----------|------|
| **iOS** | `distinct.lician.com` | https://apps.apple.com/app/lician/id6748368400 |
| **Android** | `com.lician` | https://play.google.com/store/apps/details?id=com.lician |

## App Details

- **Name**: Lician
- **Version**: 611.0 (iOS build 713, Android versionCode 646)
- **Tech Stack**: Expo SDK, React Native, Expo Router
- **Features**:
  - Portfolio tracking with real-time prices
  - AI-powered financial assistant
  - Push notifications for price alerts
  - Apple Sign In / Google Sign In
  - Bloomberg Terminal-style interface
  - 381,000+ global financial instruments

## Source Code Location

```
/Users/sebastianbenzianolsson/Developer/portfoliocare-expo/
```

Key files:
- `app.json` - Expo configuration
- `CLAUDE.md` - Mobile app-specific Claude instructions
- `src/` - Application source code

## Web Platform Integration

The web platform (lician.com) promotes the mobile app in:

1. **Footer** - "Get Lician on Mobile" section with App Store links
2. **MobileAppPromo component** - Multiple variants (banner, card, popup, footer)

Component location: `src/components/MobileAppPromo.tsx`

### Promo Component Variants

```typescript
// Footer link style (used in website footer)
<MobileAppPromo variant="footer" />

// Card style (sidebar)
<MobileAppPromo variant="card" />

// Thin banner (top of page)
<MobileAppPromo variant="banner" />

// Modal popup (after 30s delay)
<MobileAppPromo variant="popup" />
```

### Popup Hook

```typescript
import { useMobileAppPopup } from '@/components/MobileAppPromo'

// Shows popup after 30s for desktop users
const { showPopup, setShowPopup } = useMobileAppPopup(30000)
```

## Cross-Promotion Strategy

- Web users see subtle footer link to download app
- Popup shows once per week (dismissed for 7 days)
- Mobile users not shown popup (auto-detected)
- App users can be deep-linked to web features

## App Store Keywords

- Stock portfolio tracker
- AI financial assistant
- Investment research
- Market analysis
- Bloomberg alternative

---

# UI TESTING INFRASTRUCTURE (Jan 2026)

## Overview

Lician uses **Playwright** for automated UI testing and a custom **UI Audit Script** for continuous quality monitoring. The system supports Ralph loop iterative improvements.

## Quick Commands

```bash
# Run comprehensive UI audit
npx tsx scripts/ui-audit.ts

# Run Playwright tests
npx playwright test

# Run specific test file
npx playwright test tests/ui.spec.ts

# Run with UI (headed mode)
npx playwright test --headed

# View HTML report
npx playwright show-report
```

## UI Audit Script

Located at: `scripts/ui-audit.ts`

The audit script performs automated testing across 5 pages and 4 viewports (20 test combinations):

### Pages Audited
| Page | Path | Key Checks |
|------|------|------------|
| Homepage | `/` | Load time, console errors, mobile tap targets |
| Stock Page | `/stock/AAPL` | Data rendering, responsive tables |
| Compare Page | `/compare/aapl-vs-msft` | Chart loading, data fetching |
| Stock Screener | `/screener` | Query performance, filter responsiveness |
| Markets | `/markets` | Real-time data refresh |

### Viewports Tested
| Name | Width | Height | Use Case |
|------|-------|--------|----------|
| Desktop | 1920 | 1080 | Full experience |
| Laptop | 1440 | 900 | Common laptop |
| Tablet | 768 | 1024 | iPad portrait |
| Mobile | 375 | 812 | iPhone X |

### Issue Categories & Severity

| Severity | Color | Example Issues |
|----------|-------|----------------|
| Critical | Red | Page fails to load, HTTP 4xx/5xx |
| High | Orange | JavaScript errors, horizontal overflow |
| Medium | Yellow | Slow load (>5s), console errors, small tap targets |
| Low | Green | Multiple H1s, missing alt text |

### Output Files

```
tests/screenshots/audit/
├── AUDIT_SUMMARY.md      # Human-readable summary
├── audit-report.json     # Full JSON report for automation
├── homepage-desktop.png  # Full-page screenshots
├── homepage-mobile.png
├── stock-page-aapl-*.png
└── ... (20 screenshots total)
```

## Playwright Configuration

Located at: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'https://lician.com',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## Test Files

### `tests/ui.spec.ts` - Core UI Tests
- Homepage rendering and hero section
- Navigation and routing
- Stock page data display
- Mobile responsiveness
- Form interactions

### `tests/ai-chat.spec.ts` - AI Agent Tests
- Autonomous chat API endpoints
- Model selection and availability
- Tool execution (with rate limit handling)
- Streaming responses

## Issues Fixed (Jan 14, 2026)

### 1. Horizontal Overflow on Mobile
**Problem**: Stock pages had horizontal scroll on mobile devices.
**Fix**: Added `overflow-x: hidden` to body in `globals.css` and stock page wrapper.

### 2. Stripe CORS Console Errors
**Problem**: Next.js was prefetching `/api/stripe/quick-checkout` links causing CORS errors.
**Fix**: Added `prefetch={false}` to all Stripe checkout Link components.

### 3. Screener Slow Load Times
**Problem**: Screener page taking 15+ seconds to load.
**Fix**: Reduced query from 500 to 100 rows, select specific columns only instead of `SELECT *`.

### 4. False Positive Overflow Detection
**Problem**: Audit script flagged overflow even with `overflow-x: hidden` CSS.
**Fix**: Updated audit to check `getComputedStyle(body).overflowX` property.

## Ralph Loop Integration

The UI audit system integrates with the Ralph loop for iterative improvement:

```bash
# Start Ralph loop with UI audit completion promise
/ralph-loop "Fix UI issues on lician.com. Run npx tsx scripts/ui-audit.ts after fixes. Target page loads under 5 seconds, fix console errors, improve mobile tap targets." --completion-promise "UI_AUDIT_CLEAN"
```

**Completion Criteria**:
- 0 Critical issues
- 0 High issues
- All pages load under 5 seconds
- No JavaScript errors in console

## Performance Targets

| Metric | Target | Current (Jan 14) |
|--------|--------|------------------|
| Homepage Load | <3s | 3.8s |
| Stock Page Load | <3s | 2.9s |
| Screener Load | <5s | 6.5s |
| Compare Page Load | <5s | 2.5s |
| Markets Load | <4s | 3.3s |
| Console Errors | 0 | 1-5 per page |
| Mobile Tap Targets | All >44px | ~100 under |

## Troubleshooting

### Audit script fails to start
```bash
# Ensure Playwright browsers are installed
npx playwright install chromium
```

### Screenshots not capturing
```bash
# Check screenshot directory exists
mkdir -p tests/screenshots/audit
```

### False positives for overflow
The audit now checks `getComputedStyle(body).overflowX` - if set to 'hidden', overflow is not flagged even if `scrollWidth > clientWidth`.

## Environment Variables

```bash
# Override test URL (default: https://lician.com)
TEST_URL=http://localhost:3000 npx tsx scripts/ui-audit.ts
```

---

# REVENUE MONETIZATION (Jan 14, 2026)

## Overview

Three revenue streams implemented to monetize the platform while keeping core features free.

## 1. Broker Affiliate Program

**Location**: `src/components/BrokerAffiliate.tsx`

Displays on stock pages after watchlist buttons. Tracks clicks via GA4.

| Broker | Potential Commission | Affiliate URL |
|--------|---------------------|---------------|
| Interactive Brokers | $200/funded account | Replace in component |
| Robinhood | $75/signup | Replace in component |
| Webull | $50-150/account | Replace in component |

**Variants**: `inline` (default), `card`, `minimal`

```tsx
<BrokerAffiliate ticker="AAPL" variant="inline" />
```

**Analytics Event**: `affiliate_click` with broker name, ticker, placement

## 2. Premium Newsletter ($9.99/month)

**Page**: `/newsletter` - Shows free vs premium comparison

**Checkout**: `/api/stripe/newsletter-checkout?plan=monthly|annual`

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Weekly digest, AI picks, catalyst previews |
| Premium | $9.99/mo or $79.99/yr | Real-time insider alerts, institutional flow, 8-K alerts |

**Environment Variables Required** (LIVE in Vercel Production):
```bash
STRIPE_NEWSLETTER_MONTHLY_PRICE_ID=price_1SpclhDF7IaViaQF7v5pjaY4
STRIPE_NEWSLETTER_ANNUAL_PRICE_ID=price_1SpclpDF7IaViaQFBXCMFtHd
```

## 3. Developer API Access

**Page**: `/developers` - API documentation and pricing

**Signup**: `/developers/signup` - Free API key generation

**Checkout**: `/api/stripe/api-checkout?plan=basic|pro`

| Tier | Price | Requests/Day | Features |
|------|-------|--------------|----------|
| Free | $0 | 100 | US data, EOD prices |
| Basic | $29/mo | 10,000 | US + EU, real-time, insider trades |
| Pro | $99/mo | 100,000 | All data, 13F, SEC filings |
| Enterprise | Custom | Unlimited | SLA, webhooks, custom feeds |

**Database Table**: `api_keys` (migration: `20260114000001_api_keys.sql`)

**Environment Variables Required** (LIVE in Vercel Production):
```bash
STRIPE_API_BASIC_PRICE_ID=price_1SpclxDF7IaViaQFN0M839UB
STRIPE_API_PRO_PRICE_ID=price_1Spcm4DF7IaViaQFXTSkAgT0
```

## Files Created

```
src/components/BrokerAffiliate.tsx           # Affiliate link component
src/app/api/stripe/newsletter-checkout/      # Newsletter Stripe checkout
src/app/api/stripe/api-checkout/             # API access Stripe checkout
src/app/api/developers/create-key/           # API key generation
src/app/developers/page.tsx                  # Developer portal
src/app/developers/signup/page.tsx           # API key signup form
supabase/migrations/20260114000001_api_keys.sql  # API keys table
```

## Stripe Setup Status ✅ COMPLETE (Jan 14, 2026)

All products created and environment variables configured:

| Product | Price ID | Status |
|---------|----------|--------|
| Newsletter Monthly | `price_1SpclhDF7IaViaQF7v5pjaY4` | ✅ Live |
| Newsletter Annual | `price_1SpclpDF7IaViaQFBXCMFtHd` | ✅ Live |
| API Basic | `price_1SpclxDF7IaViaQFN0M839UB` | ✅ Live |
| API Pro | `price_1Spcm4DF7IaViaQFXTSkAgT0` | ✅ Live |

**Checkout Endpoints**:
- Newsletter: `https://quant-platform.vercel.app/api/stripe/newsletter-checkout?plan=monthly|annual`
- API Access: `https://quant-platform.vercel.app/api/stripe/api-checkout?plan=basic|pro`
- Premium: POST to `/api/stripe/create-checkout` with `{ planId: "monthly"|"annual" }`

---

# ROADMAP TO #1 FINANCIAL AI AGENT (Jan 2026)

## Research Summary

Based on comprehensive research of the 2025-2026 financial AI landscape, here's what differentiates the best financial AI agents:

### Market Leaders Analysis

| Platform | Strengths | Cost | Gap vs Lician |
|----------|-----------|------|---------------|
| **Bloomberg Terminal** | Comprehensive data, 40+ years | $20,000/yr | We're FREE |
| **AlphaSense** | Document analysis, sentiment | $$$$ | We need RAG |
| **Perplexity Finance** | Real-time, earnings hub | Free | We need live transcripts |
| **Morgan Stanley AI** | RAG, portfolio-specific | Internal | We need portfolio integration |

### Key Industry Trends (Gartner 2026)

- 40% of finance departments will deploy autonomous agents by 2027
- Global AI in financial services: $35B market (24.5% CAGR)
- Investment banks seeing 27-35% productivity gains from AI
- RAG + Multi-Agent systems becoming standard

### Sources
- [AI Agents for Finance 2026 Guide](https://rtslabs.com/ai-agents-for-finance/)
- [Perplexity Finance](https://www.perplexity.ai/finance)
- [RAG in Finance Use Cases](https://arya.ai/blog/rag-in-finance-top-10-use-cases)
- [Vercel AI SDK Agents](https://sdk.vercel.ai/docs/foundations/agents)
- [MongoDB Agentic Portfolio Management](https://www.mongodb.com/docs/atlas/architecture/current/solutions-library/fin-services-agentic-portfolio/)

## Current State (Jan 14, 2026)

### What's Working ✅

| Feature | Status | Details |
|---------|--------|---------|
| **5-Phase Workflow** | ✅ | Understand → Plan → Execute → Reflect → Answer |
| **Multi-Model Gateway** | ✅ | 6 models (GPT-4o, Claude, Gemini, Llama) |
| **Supabase Integration** | ✅ | 839K+ financial records, 5.3K US companies |
| **EU Companies** | ✅ | 107K+ companies (Norway, Sweden, etc.) |
| **SEC Filings Tool** | ✅ | 10-K, 10-Q, 8-K access |
| **Firecrawl Web Research** | ✅ | Deep research, news, IR crawling |
| **Smart Validation** | ✅ | "DEFAULT TO COMPLETE" logic |
| **Fast Model Routing** | ✅ | Gemini Flash for tool selection |
| **Debt Ratio Calculation** | ✅ | Auto-calculate from balance sheet |

### Gaps vs Industry Leaders ❌

| Feature | Bloomberg | Perplexity | AlphaSense | Lician |
|---------|-----------|------------|------------|--------|
| RAG/Vector Search | ✅ | ✅ | ✅ | ❌ |
| Live Earnings Transcripts | ✅ | ✅ | ✅ | ❌ |
| Sentiment Analysis | ✅ | ✅ | ✅ | ❌ |
| Portfolio Integration | ✅ | ❌ | ❌ | ❌ |
| Crypto Data | ✅ | ✅ | ❌ | ❌ |
| Automated Alerts | ✅ | ✅ | ✅ | ❌ |
| Multi-Agent Workflows | ❌ | ❌ | ❌ | Partial |

## PHASE 1: Foundation (Week 1-2)

### 1.1 RAG Infrastructure with Vector Database

**Why**: RAG is the #1 differentiator. Morgan Stanley, AlphaSense all use it.

```typescript
// Implementation Plan
// 1. Add Supabase pgvector extension
CREATE EXTENSION vector;

// 2. Create embeddings table
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'sec_filing', 'earnings_call', 'news', 'research'
  source_url TEXT,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

// 3. Create similarity search function
CREATE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (
  id UUID,
  ticker TEXT,
  content TEXT,
  similarity float
);
```

**New Tools to Add**:
```typescript
// RAG Specialist Agent tools
searchFinancialDocuments({ query: string, ticker?: string, docType?: string })
embedAndStoreDocument({ content: string, ticker: string, docType: string, metadata: object })
getSemanticContext({ query: string, topK: number })
```

### 1.2 Live Earnings Transcripts

**Why**: Perplexity's #1 feature. Real-time insights during earnings calls.

```typescript
// Earnings Hub Implementation
interface EarningsEvent {
  ticker: string
  company: string
  date: string
  time: string
  estimatedEPS: number
  status: 'upcoming' | 'live' | 'completed'
  transcriptUrl?: string
}

// New Cron Job: /api/cron/sync-earnings-calendar
// Sources: SEC EDGAR, Yahoo Finance earnings API
// Frequency: Every 6 hours

// Live Transcript Processing
// 1. Use Firecrawl to monitor IR page during earnings
// 2. Process transcript in real-time with streaming
// 3. Extract key metrics: revenue, EPS, guidance
// 4. Generate AI summary while call is live
```

**New Tools to Add**:
```typescript
getUpcomingEarnings({ days?: number, tickers?: string[] })
getLiveEarningsTranscript({ ticker: string })
getEarningsSummary({ ticker: string, quarter: string })
```

### 1.3 Enhanced Multi-Agent Architecture

**Why**: Deloitte shows 27-35% productivity gains from specialized agents.

```typescript
// Agent Specializations
const SPECIALIST_AGENTS = {
  // Data Retrieval Specialist
  dataRetriever: {
    model: 'gemini-flash', // Fast, cheap
    tools: ['getStockQuote', 'getFinancialStatements', 'searchStocks'],
    role: 'Fetch accurate, timely market data'
  },

  // RAG Specialist
  ragSpecialist: {
    model: 'gpt-4o-mini', // Good at semantic search
    tools: ['searchFinancialDocuments', 'getSemanticContext'],
    role: 'Retrieve relevant context from knowledge base'
  },

  // Analysis Specialist
  analysisSpecialist: {
    model: 'claude-sonnet-4', // Best reasoning
    tools: ['compareStocks', 'getAnalystRatings'],
    role: 'Perform deep financial analysis'
  },

  // News & Sentiment Specialist
  sentimentSpecialist: {
    model: 'gpt-4o-mini',
    tools: ['searchRecentNews', 'analyzeSentiment'],
    role: 'Analyze market sentiment and news'
  }
}

// Orchestrator coordinates specialists
class MultiAgentOrchestrator {
  async run(query: string) {
    // 1. Route to appropriate specialist(s)
    // 2. Aggregate results
    // 3. Synthesize final answer
  }
}
```

## PHASE 2: Differentiation (Week 3-4)

### 2.1 Sentiment Analysis Engine

**Why**: NLP on earnings calls reveals subtle confidence shifts.

```typescript
// Sentiment Analysis Pipeline
interface SentimentResult {
  overall: 'bullish' | 'neutral' | 'bearish'
  confidence: number
  signals: {
    source: string
    text: string
    sentiment: number
    impact: 'high' | 'medium' | 'low'
  }[]
}

// Implementation using Vercel AI SDK
const analyzeSentimentTool = tool({
  description: 'Analyze sentiment from news, earnings calls, social media',
  inputSchema: z.object({
    ticker: z.string(),
    sources: z.array(z.enum(['news', 'earnings', 'social', 'sec_filings'])),
    timeRange: z.enum(['day', 'week', 'month'])
  }),
  execute: async ({ ticker, sources, timeRange }) => {
    // 1. Fetch content from each source
    // 2. Run through sentiment model
    // 3. Aggregate and weight by source reliability
    // 4. Return structured sentiment analysis
  }
})
```

### 2.2 Portfolio Integration

**Why**: Morgan Stanley's RAG is portfolio-specific. Personalization wins.

```typescript
// Portfolio-Aware Analysis
interface PortfolioContext {
  holdings: { ticker: string; shares: number; avgCost: number }[]
  sectors: { name: string; weight: number }[]
  totalValue: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

// New System Prompt Addition
const PORTFOLIO_AWARE_PROMPT = `
You have access to the user's portfolio. Provide personalized analysis:
- Highlight how news affects their specific holdings
- Suggest rebalancing if sector weights are off
- Alert on concentrated risk exposure
- Calculate portfolio-level impact of market moves
`

// New Tools
getPortfolioContext({ userId: string })
analyzePortfolioImpact({ event: string, portfolio: PortfolioContext })
suggestRebalancing({ portfolio: PortfolioContext, targetAllocation: object })
```

### 2.3 Crypto Integration

**Why**: Perplexity partnered with Coinbase. Growing demand.

```typescript
// Crypto Data Sources
// 1. CoinGecko API (free tier: 10-30 req/min)
// 2. Coinbase API (real-time prices)
// 3. On-chain data via Dune Analytics

// New Tools
getCryptoPrice({ symbol: string }) // BTC, ETH, etc.
getCryptoMarketData({ limit?: number }) // Top cryptos
getCryptoSentiment({ symbol: string }) // Social sentiment
compareCryptoToTraditional({ crypto: string, stock: string })
```

## PHASE 3: Moat Building (Week 5-6)

### 3.1 Automated Research Tasks

**Why**: Perplexity's automated tasks are a killer feature.

```typescript
// Scheduled Research Tasks
interface ResearchTask {
  id: string
  userId: string
  query: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  deliveryMethod: 'email' | 'push' | 'in-app'
  lastRun?: Date
  nextRun: Date
}

// Cron Job: /api/cron/run-research-tasks
// Executes user-defined research queries on schedule
// Sends results via preferred delivery method

// New API Endpoints
POST /api/tasks/create
GET /api/tasks/list
DELETE /api/tasks/:id
```

### 3.2 Global Coverage Expansion

**Why**: Currently US + EU. Add Asia, LATAM for global reach.

```typescript
// Priority Markets
const EXPANSION_MARKETS = {
  // Asia (High Priority)
  'JP': { exchanges: ['TSE'], companies: 3800, source: 'JPX API' },
  'HK': { exchanges: ['HKEX'], companies: 2600, source: 'HKEX API' },
  'CN': { exchanges: ['SSE', 'SZSE'], companies: 5000, source: 'Wind/Tushare' },

  // LATAM (Medium Priority)
  'BR': { exchanges: ['B3'], companies: 400, source: 'B3 API' },
  'MX': { exchanges: ['BMV'], companies: 150, source: 'BMV API' },

  // Rest of World
  'AU': { exchanges: ['ASX'], companies: 2200, source: 'ASX API' },
  'IN': { exchanges: ['NSE', 'BSE'], companies: 7000, source: 'NSE API' },
}
```

### 3.3 Voice Interface (Mobile App)

**Why**: Mobile is the future. Voice commands for quick queries.

```typescript
// Voice Query Flow (React Native)
// 1. Speech-to-text via Whisper API
// 2. Process query through autonomous agent
// 3. Text-to-speech response via ElevenLabs

// Mobile-Optimized Responses
const VOICE_RESPONSE_PROMPT = `
Keep responses concise for voice (under 30 seconds spoken).
Lead with the key number or insight.
Skip detailed breakdowns unless asked.
Example: "NVDA is up 2.3% today, trading at $142. PE ratio is 45, above sector average."
`
```

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| RAG/Vector Search | 🔴 High | 🟡 Medium | **P0** |
| Live Earnings Hub | 🔴 High | 🟡 Medium | **P0** |
| Sentiment Analysis | 🟡 Medium | 🟡 Medium | **P1** |
| Portfolio Integration | 🔴 High | 🟢 Low | **P1** |
| Multi-Agent Workflow | 🟡 Medium | 🔴 High | **P2** |
| Automated Tasks | 🟡 Medium | 🟢 Low | **P2** |
| Crypto Integration | 🟢 Low | 🟢 Low | **P3** |
| Global Expansion | 🟡 Medium | 🔴 High | **P3** |
| Voice Interface | 🟢 Low | 🟡 Medium | **P4** |

## Success Metrics

### User Engagement
- **Query Success Rate**: % of queries answered completely (target: >90%)
- **Time to Insight**: Average seconds to answer (target: <15s)
- **Return Rate**: % of users who return within 7 days (target: >40%)

### Data Quality
- **Data Freshness**: Max age of financial data (target: <1 hour)
- **Coverage**: % of S&P 500 with full data (target: 100%)
- **Accuracy**: Error rate in financial figures (target: <0.1%)

### Competitive Position
- **Feature Parity**: Match Perplexity Finance features (target: 100%)
- **Cost Advantage**: Stay free while others charge (target: $0)
- **Speed**: Faster than Bloomberg on basic queries (target: 3x)

## Technical Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│   Web (lician.com)  │  Mobile (iOS/Android)  │  API (developers)  │  Voice │
└───────────┬─────────────────────┬──────────────────────┬───────────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MULTI-AGENT ORCHESTRATOR                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Data Agent  │  │ RAG Agent   │  │ Analysis    │  │ Sentiment Agent     │ │
│  │ (Gemini)    │  │ (GPT-4o)    │  │ (Claude)    │  │ (GPT-4o-mini)       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────┬─────────────────────┬──────────────────────┬───────────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
├─────────────────┬───────────────────┬───────────────────┬───────────────────┤
│   Supabase      │   Vector DB       │   Real-time       │   External APIs   │
│   (Structured)  │   (Embeddings)    │   (WebSocket)     │   (Fallback)      │
│   - Financials  │   - SEC Filings   │   - Prices        │   - Financial     │
│   - Companies   │   - Earnings      │   - Earnings      │     Datasets      │
│   - Prices      │   - News          │   - Alerts        │   - EODHD         │
│   - EU Data     │   - Research      │                   │   - Firecrawl     │
└─────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

---

# SPEED ARCHITECTURE - HOW DEXTER DOES IT (Jan 15, 2026)

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

## Why This Matters

```
❌ WRONG: "Get AAPL's revenue" → RAG search → 1000ms
✅ RIGHT: "Get AAPL's revenue" → Direct SQL → 100ms

❌ WRONG: "What is NVDA's PE?" → RAG search → 1000ms
✅ RIGHT: "What is NVDA's PE?" → Direct SQL → 50ms

✅ CORRECT: "What did Tim Cook say about AI?" → RAG search → 500ms
   (This SHOULD use RAG - it's searching for specific text)
```

## Speed Optimizations Implemented

1. **Gemini Flash for tool selection** - Fast, cheap model picks tools
2. **DEFAULT TO COMPLETE** - Don't over-iterate
3. **Just-in-time tool selection** - Only load what's needed
4. **Direct Supabase queries** - No unnecessary abstraction
5. **HNSW index** - Fastest vector search algorithm
6. **halfvec storage** - 50% smaller, same speed

---

# RAG EMBEDDINGS INFRASTRUCTURE (Jan 15, 2026)

## Overview

RAG is the **SLOW PATH** - only use for unstructured text queries. Lician uses **pgvector** with **halfvec** storage and **HNSW** indexes for semantic search on financial documents. This enables queries like "What did Apple say about iPhone sales?" to return relevant passages from SEC filings and earnings transcripts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMBEDDING PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│   User Query → AI SDK embed() → text-embedding-3-small → 1536-dim vector   │
│                                      ↓                                       │
│                         Supabase match_documents() RPC                       │
│                                      ↓                                       │
│                    HNSW cosine similarity search (halfvec)                   │
│                                      ↓                                       │
│                      Top-K relevant document chunks                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Choices (Researched Jan 2026)

### Why pgvector (not Vector Buckets)?

| Feature | pgvector | Vector Buckets |
|---------|----------|----------------|
| **Scale** | <1M vectors | 10M+ vectors |
| **Latency** | ~10-100ms | ~100-500ms |
| **Use Case** | User-facing queries | Archival/batch |
| **Our Need** | ✅ Perfect fit | ❌ Overkill |

Vector Buckets (S3-native) are for massive scale. We have <100K documents - pgvector is ideal.

### Why halfvec (not vector)?

| Type | Storage | Bits | Quality Loss |
|------|---------|------|--------------|
| `vector(1536)` | Full | 32-bit | None |
| `halfvec(1536)` | **50% less** | 16-bit | Minimal |

halfvec saves 50% storage with negligible quality loss. Recommended by Supabase.

### Why HNSW (not IVFFlat)?

| Index | Speed | Training | Memory |
|-------|-------|----------|--------|
| IVFFlat | Fast | Required | Lower |
| **HNSW** | Fastest | None | Higher |

HNSW is the latest best practice - faster and no training phase.

### Why text-embedding-3-small (not ada-002)?

| Model | Dimensions | Cost/1M tokens | Quality |
|-------|-----------|----------------|---------|
| ada-002 | 1536 | $0.10 | Good |
| **3-small** | 1536 | **$0.02** | Same |
| 3-large | 3072 | $0.13 | Best |

5x cheaper with same quality. Uses AI SDK `embed()` function.

## Database Schema

### document_embeddings Table

```sql
-- Migration: 20260115000001_rag_embeddings_infrastructure.sql

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document identification
  ticker TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'sec_filing',           -- 10-K, 10-Q, 8-K filings
    'earnings_transcript',  -- Earnings call transcripts
    'news',                 -- News articles
    'research',             -- Analyst reports
    'company_overview'      -- Company descriptions
  )),
  source_url TEXT,
  document_date DATE,

  -- Content
  title TEXT,
  content TEXT NOT NULL,
  content_chunk_index INTEGER DEFAULT 0,  -- For long docs split into chunks

  -- Embedding (halfvec for 50% storage savings)
  embedding halfvec(1536),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_document_embeddings_vector
  ON document_embeddings
  USING hnsw (embedding halfvec_cosine_ops);
```

### match_documents() RPC Function

```sql
CREATE FUNCTION match_documents(
  query_embedding halfvec(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_ticker text DEFAULT NULL,
  filter_doc_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID, ticker TEXT, document_type TEXT, title TEXT,
  content TEXT, source_url TEXT, document_date DATE, similarity float
);
```

## AI Tools

### searchFinancialDocuments

Primary RAG search tool for semantic queries.

```typescript
// Usage in AI agent
const results = await searchFinancialDocuments({
  query: "What did Apple say about iPhone sales?",
  ticker: "AAPL",
  documentType: "earnings_transcript",
  limit: 5
})
```

### getSemanticContext

Retrieves context from multiple document types for comprehensive answers.

```typescript
const context = await getSemanticContext({
  query: "Apple's revenue guidance",
  tickers: ["AAPL"],
  topK: 3
})
```

## Embedding Generation

### Cron Job: /api/cron/generate-embeddings

Processes documents in batches using AI SDK `embedMany()`.

```typescript
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

// Batch embed documents (auto-chunks large batches)
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: documents.map(d => d.content),
})
```

### Document Sources

| Source | Trigger | Priority |
|--------|---------|----------|
| SEC Filings | On sync from EDGAR | High |
| Company Fundamentals | On profile update | Medium |
| News Articles | On Firecrawl fetch | Medium |
| Earnings Transcripts | Manual/Firecrawl | High |

## Current Data Status

| Table | Records | Embeddings |
|-------|---------|------------|
| `document_embeddings` | 0 | Pending |
| `income_statements` | 313,902 | Not embedded |
| `sec_filings` | 1,245 | Not embedded |
| `company_fundamentals` | 139,584 | Not embedded |

## Files

### Migration
- `supabase/migrations/20260115000001_rag_embeddings_infrastructure.sql`

### AI Tools
- `src/lib/ai/tools.ts` - searchFinancialDocuments, getSemanticContext

### Cron Jobs (to create)
- `/api/cron/generate-embeddings` - Batch embedding generation

## Environment Variables

```bash
# AI SDK uses this automatically for embeddings
OPENAI_API_KEY=sk-...

# Supabase for vector storage
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Testing RAG

```bash
# Test semantic search (requires documents in database)
curl -X POST https://lician.com/api/chat/autonomous \
  -H "Content-Type: application/json" \
  -d '{"query": "What did Apple say about iPhone sales?", "model": "gpt-4o-mini"}'
```

---

**The Goal**: Be the #1 FREE financial AI agent by combining:
- Bloomberg's data depth
- Perplexity's real-time intelligence
- AlphaSense's document analysis
- Morgan Stanley's personalization

**All for $0.**
