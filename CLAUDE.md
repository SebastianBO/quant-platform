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
