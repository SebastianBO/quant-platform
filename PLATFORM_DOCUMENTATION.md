# Lician Platform Documentation

> **Last Updated:** December 15, 2025
> **Version:** 1.0.0
> **Status:** Production

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Data Pipelines & Cron Jobs](#6-data-pipelines--cron-jobs)
7. [SEO Implementation](#7-seo-implementation)
8. [Monetization System](#8-monetization-system)
9. [Admin Dashboard](#9-admin-dashboard)
10. [External Integrations](#10-external-integrations)
11. [Deployment](#11-deployment)
12. [Troubleshooting](#12-troubleshooting)
13. [Known Issues & Fixes](#13-known-issues--fixes)
14. [Future Recommendations](#14-future-recommendations)

---

## 1. Executive Summary

**Lician** is an AI-powered quantitative finance platform providing institutional-grade stock research and analysis tools. The platform combines real-time market data, fundamental analysis, AI-driven insights, and portfolio management into a comprehensive investment research solution.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Stock Analysis | Real-time quotes, financials, DCF valuations |
| AI Insights | Claude/GPT-powered investment summaries |
| Portfolio Management | Plaid/Tink brokerage integration |
| Institutional Data | 13F filings, insider trades, ownership |
| Biotech Tracking | Clinical trials, FDA approvals, catalysts |
| Programmatic SEO | 100K+ indexed stock pages |

### Business Model

- **B2C SaaS**: $109/month or $699/year subscription
- **B2B API**: Enterprise data access (custom pricing)
- **Free Tier**: Basic stock lookup and market overview

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 16 (App Router) + React 19 + Tailwind CSS              │
│  Deployed on Vercel Edge Network                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (83 routes)                       │
│  /api/v1/*     - Public financial data API                      │
│  /api/admin/*  - Admin operations                               │
│  /api/cron/*   - Scheduled task endpoints                       │
│  /api/stripe/* - Payment processing                             │
│  /api/plaid/*  - US brokerage integration                       │
│  /api/tink/*   - EU banking integration                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  Supabase PostgreSQL (90+ tables)                               │
│  pg_cron + pg_net for scheduled jobs                            │
│  Row Level Security (RLS) for user data                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL DATA SOURCES                          │
│  SEC EDGAR | EODHD | Financial Datasets | ClinicalTrials.gov    │
│  openFDA | OpenFIGI | FINRA | Plaid | Tink | Stripe             │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. User visits `/stock/AAPL`
2. Next.js server component fetches data from API routes
3. API routes query Supabase or external APIs
4. Data cached in Supabase for subsequent requests
5. AI summaries generated via Claude/GPT on demand
6. Page rendered with structured data for SEO

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | Full-stack React framework |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.1.9 | Styling |
| Radix UI | Latest | Accessible components |
| Recharts | 2.15.4 | Data visualization |
| Lucide React | 0.454.0 | Icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | Database + Auth + Realtime |
| PostgreSQL | 15.x | Primary database |
| pg_cron | 1.6.4 | Job scheduling |
| pg_net | Latest | Async HTTP requests |

### AI/ML

| Technology | Purpose |
|------------|---------|
| Anthropic Claude | Primary AI analysis |
| OpenAI GPT-4 | Fallback + Vision |
| AI SDK (Vercel) | Unified AI interface |

### Payments

| Technology | Purpose |
|------------|---------|
| Stripe | Payment processing |
| RevenueCat | Mobile subscription sync |

### Integrations

| Service | Purpose |
|---------|---------|
| Plaid | US brokerage accounts |
| Tink | EU banking accounts |
| Vercel | Hosting + Edge + Analytics |

---

## 4. Database Schema

### Table Categories (90+ tables)

```
supabase/migrations/
├── 20251209000000_create_short_volume_table.sql
├── 20251209031941_create_subscriptions.sql
├── 20251209100000_add_plaid_tink_tables.sql
├── 20251209110000_add_webhook_logs.sql
├── 20251209120000_institutional_ownership.sql
├── 20251210000001_financial_statements.sql
├── 20251210000002_insider_trades.sql
├── 20251210000003_prices_news.sql
├── 20251210000004_sync_queue.sql
├── 20251210000005_financial_cron_jobs.sql
├── 20251210000006_additional_cron_jobs.sql
├── 20251210100000_setup_cron_jobs.sql
├── 20251211000000_company_bonds.sql
├── 20251211000001_add_bonds_cron_job.sql
├── 20251211100000_add_tink_credentials_id.sql
├── 20251211110000_clinical_trials.sql
├── 20251211120000_update_biotech_aliases.sql
├── 20251211130000_biotech_enhanced.sql
├── 20251211140000_biotech_sync_state.sql
├── 20251213000000_add_biotech_cron_jobs.sql
└── 20251215000000_fix_cron_job_endpoints.sql
```

### Core Tables

#### Financial Data
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `income_statements` | Quarterly/annual income | ticker, report_period, revenue, net_income |
| `balance_sheets` | Balance sheet data | ticker, total_assets, total_liabilities |
| `cash_flow_statements` | Cash flow data | ticker, operating_cash_flow, free_cash_flow |
| `financial_metrics` | Calculated ratios | ticker, pe_ratio, roe, debt_to_equity |
| `short_volume` | FINRA short data | ticker, trade_date, short_volume, total_volume |

#### Ownership & Filings
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `institutional_investors` | 13F filers | cik, name, aum, positions_count |
| `institutional_holdings` | Fund positions | investor_cik, ticker, shares, value |
| `institutional_filings` | 13F filings | cik, accession_number, report_date |
| `insider_trades` | Form 4 transactions | ticker, insider_name, shares, transaction_type |

#### Biotech
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `clinical_trials` | ClinicalTrials.gov | nct_id, ticker, phase, status, completion_date |
| `biotech_catalysts` | Upcoming events | ticker, catalyst_type, expected_date |
| `biotech_company_mapping` | Ticker to sponsor | ticker, sponsor_aliases[] |

#### User Data
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profiles | id, email, is_premium, stripe_customer_id |
| `subscriptions` | Subscription records | user_id, stripe_subscription_id, status |
| `portfolios` | User portfolios | user_id, name, total_value |
| `investments` | Portfolio holdings | portfolio_id, ticker, shares, avg_cost |
| `plaid_items` | Plaid connections | user_id, access_token, institution_name |
| `tink_connections` | Tink connections | user_id, access_token, credentials_id |

#### System
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cron_job_log` | Cron execution log | job_name, executed_at, status |
| `data_freshness` | Data staleness tracking | data_type, last_sync, record_count |
| `financial_sync_log` | Sync history | ticker, sync_type, status, items_created |
| `webhook_logs` | Webhook events | source, event_type, payload |

---

## 5. API Reference

### Public API (`/api/v1/*`)

#### Prices
```
GET /api/v1/prices?ticker=AAPL
GET /api/v1/prices/snapshot?ticker=AAPL
```

#### Financial Statements
```
GET /api/v1/financials/income-statements?ticker=AAPL
GET /api/v1/financials/balance-sheets?ticker=AAPL
GET /api/v1/financials/cash-flow-statements?ticker=AAPL
GET /api/v1/financials/segmented-revenues?ticker=AAPL
```

#### Ownership
```
GET /api/v1/institutional-ownership?ticker=AAPL
GET /api/v1/institutional-ownership/investors?cik=102909
GET /api/v1/insider-trades?ticker=AAPL
```

#### Other
```
GET /api/v1/financial-metrics?ticker=AAPL
GET /api/v1/analyst-estimates?ticker=AAPL
GET /api/v1/filings?ticker=AAPL
GET /api/v1/news?ticker=AAPL
GET /api/v1/company/facts?ticker=AAPL
```

### Internal API

#### Stock Data
```
GET /api/stock?ticker=AAPL           # Full stock snapshot
GET /api/chart-data?ticker=AAPL      # OHLCV history
GET /api/fundamentals?ticker=AAPL    # Fundamental score
GET /api/company-debt?ticker=AAPL    # Debt analysis
```

#### AI
```
POST /api/ai-summary     # AI investment summary
POST /api/chat           # Streaming chat (Claude)
POST /api/portfolio      # Portfolio analysis with OCR
```

#### Biotech
```
GET /api/clinical-trials?ticker=MRNA
GET /api/fda-approvals?ticker=MRNA
GET /api/biotech-catalysts?ticker=MRNA
GET /api/biotech/[ticker]
```

### Admin API (`/api/admin/*`)

```
GET  /api/admin/status              # System health
POST /api/admin/status              # Trigger actions
POST /api/admin/sync/financials     # Single ticker sync
POST /api/admin/sync/batch          # Batch sync
POST /api/admin/ingest-13f          # 13F ingestion
POST /api/admin/migrate             # Run migrations
```

### Cron Endpoints (`/api/cron/*`)

```
GET /api/cron/sync-portfolios       # Sync Plaid/Tink
GET /api/cron/sync-financials       # Sync SEC data
GET /api/cron/sync-short-volume     # Sync FINRA data
GET /api/cron/sync-bonds            # Sync bond data
GET /api/cron/sync-clinical-trials  # Sync trials
GET /api/cron/sync-biotech          # Sync biotech
GET /api/cron/watch-filings         # Watch SEC RSS
```

---

## 6. Data Pipelines & Cron Jobs

### Supabase pg_cron Configuration

Cron jobs are managed via Supabase's `pg_cron` extension. Jobs make HTTP requests to API endpoints using `pg_net`.

#### Active Jobs (as of Dec 15, 2025)

| Job Name | Schedule | Endpoint | Purpose |
|----------|----------|----------|---------|
| `sync-short-volume-daily` | `30 21 * * 1-5` | `/api/cron/sync-short-volume` | FINRA short data |
| `sync-financials-daily` | `0 6 * * *` | `/api/cron/sync-financials` | SEC financials |
| `sync-portfolios-daily` | `0 21 * * 1-5` | `/api/cron/sync-portfolios` | User portfolios |
| `sync-13f-holdings-v2` | `0 6 * * *` | `/api/admin/sync/batch` | Institutional holdings |
| `sync-financials-batch-v2` | `0 7 * * *` | `/api/admin/sync/batch` | Top 10 companies |
| `sync-insider-trades-v2` | `0 15 * * 1-5` | `/api/cron/sync-financials` | Form 4 trades |
| `sync-top-institutions-weekly` | `0 5 * * 0` | `/api/admin/sync/batch` | Full institutional sync |
| `sync-clinical-trials-4h` | `0 */4 * * *` | `/api/cron/sync-biotech` | Clinical trials |
| `sync-clinical-trials-weekday-1` | `0 10 * * 1-5` | `/api/cron/sync-biotech` | Trials (morning) |
| `sync-clinical-trials-weekday-2` | `0 16 * * 1-5` | `/api/cron/sync-biotech` | Trials (afternoon) |
| `discover-biotech-weekly` | `0 4 * * 0` | `/api/biotech-discovery` | Find new biotechs |
| `update-data-freshness` | `0 * * * *` | Internal function | Freshness metrics |

#### Vercel Cron Backup

`vercel.json` also has backup crons (redundant with Supabase):

```json
{
  "crons": [
    {"path": "/api/cron/sync-portfolios", "schedule": "0 21 * * 1-5"},
    {"path": "/api/cron/sync-financials?mode=continue&limit=5", "schedule": "0 6 * * *"}
  ]
}
```

### Data Sources & Rate Limits

| Source | Data | Rate Limit | Notes |
|--------|------|------------|-------|
| SEC EDGAR | Filings, XBRL, 13F | 10 req/sec | Official SEC API |
| EODHD | Prices, fundamentals | Per plan | Requires API key |
| Financial Datasets | Metrics, ownership | Per plan | Premium API |
| ClinicalTrials.gov | Trial data | ~1 req/sec | Free, rate limited |
| openFDA | Drug approvals | Generous | Free API |
| FINRA | Short volume | Daily files | Public data |
| OpenFIGI | Bond identifiers | 6 req/min | Free with limits |

### Monitoring Cron Jobs

#### Check Scheduler Status
```sql
SELECT pid, usename, application_name, backend_start, state
FROM pg_stat_activity
WHERE application_name ILIKE 'pg_cron scheduler';
```

#### Check Recent Executions
```sql
SELECT jobname, status, start_time, return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

#### Check Custom Logs
```sql
SELECT * FROM cron_job_log
ORDER BY executed_at DESC
LIMIT 20;
```

#### Troubleshooting

If jobs aren't running:
1. Check if scheduler is alive (query above)
2. If no results, do **Fast Reboot** in Supabase Settings > General
3. Check `cron.job_run_details` for errors
4. Verify pg_net is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_net';`

---

## 7. SEO Implementation

### Overview

The platform uses programmatic SEO to generate 100K+ indexable pages for stock-related queries.

### Sitemap Architecture

```
/sitemap.xml              # Main sitemap (100 top stocks)
/sitemap-index.xml        # Sitemap index
/sitemap-seo.xml          # SEO landing pages
/sitemap-stocks-hot.xml   # Top 50 stocks (hourly)
/sitemap-stocks-warm.xml  # 90K stocks (daily)
/sitemap-stocks-cold.xml  # Long-tail (weekly)
```

### SEO Pages

| Route | Purpose | Example |
|-------|---------|---------|
| `/stock/[ticker]` | Stock analysis | /stock/aapl |
| `/should-i-buy/[ticker]` | Buy decision | /should-i-buy/aapl |
| `/prediction/[ticker]` | Price forecast | /prediction/aapl |
| `/compare/[slugs]` | Stock comparison | /compare/aapl-vs-msft |
| `/best-stocks/[category]` | Category lists | /best-stocks/dividend |
| `/stocks/[...filters]` | Filtered lists | /stocks/tech/growth |

### Metadata Generation

All dynamic pages use `generateMetadata()`:

```typescript
// src/app/stock/[ticker]/page.tsx
export async function generateMetadata({ params }) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Stock Price, Analysis & News`,
    description: `${symbol} stock analysis with real-time quotes...`,
    keywords: [`${symbol} stock`, `${symbol} price`, ...],
    openGraph: {
      images: [`/api/og/stock/${ticker}`],
    },
    alternates: {
      canonical: `https://lician.com/stock/${ticker}`,
    },
  }
}
```

### Structured Data

JSON-LD schemas implemented via `src/lib/seo.ts`:

| Schema | Pages | Purpose |
|--------|-------|---------|
| Organization | Global (layout) | Google Knowledge Panel |
| WebSite | Global (layout) | Sitelinks searchbox |
| BreadcrumbList | All pages | Navigation breadcrumbs |
| Article | Analysis pages | Article rich results |
| FinancialProduct | Stock pages | Stock rich results |
| FAQPage | Stock pages | FAQ rich results |

### robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Allow: /api/og/

User-agent: GPTBot
Disallow: /

Sitemap: https://lician.com/sitemap.xml
Sitemap: https://lician.com/sitemap-index.xml
```

### OG Images

Dynamic Open Graph images generated at `/api/og/[...slug]`:
- Stock pages: `/api/og/stock/aapl`
- Comparison: `/api/og/compare/aapl-vs-msft`
- Predictions: `/api/og/prediction/aapl`

### SEO Score: 8.4/10

**Strengths:**
- Comprehensive sitemap strategy
- Dynamic metadata for all pages
- Structured data implementation
- Internal linking via RelatedLinks component

**Areas for Improvement:**
- Add more FAQ content
- Implement review schema for ratings
- Add video schema if videos added
- Monitor Core Web Vitals

---

## 8. Monetization System

### Pricing Tiers

| Plan | Price | Billing | Trial |
|------|-------|---------|-------|
| Monthly | $109/month | Monthly | None |
| Annual | $699/year | Annual | 3 days |

### Stripe Integration

**Files:**
- `/src/app/api/stripe/create-checkout/route.ts`
- `/src/app/api/stripe/webhook/route.ts`
- `/src/app/api/stripe/portal/route.ts`
- `/src/app/api/stripe/verify-session/route.ts`

**Environment Variables:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ANNUAL_PRICE_ID=price_1Rkd...
STRIPE_MONTHLY_PRICE_ID=price_1Rkd...
```

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription, set `is_premium` |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Remove premium access |
| `invoice.payment_succeeded` | Log payment |
| `invoice.payment_failed` | Log failure |

### RevenueCat Sync

Web subscriptions sync to mobile via RevenueCat API:
- Entitlement: `lician.pro`
- Duration: yearly or monthly mapped

### Premium Features

Features gated by `is_premium` flag:
- AI-powered analysis
- DCF valuations
- 10+ years historical data
- Institutional ownership details
- Real-time data
- Advanced charts

**Current Status:** Paywall NOT enforced - needs implementation.

### Database Schema

```sql
-- profiles table additions
ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN premium_since TIMESTAMPTZ;

-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,  -- active, trialing, canceled, etc.
  plan_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE
);

-- payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  stripe_invoice_id TEXT,
  amount INTEGER,  -- cents
  currency TEXT DEFAULT 'USD',
  status TEXT
);
```

---

## 9. Admin Dashboard

### Access

- URL: `/admin`
- Auth: Password-based (`ADMIN_PASSWORD` env var)
- Default: `lician-admin-2025`

### Features

#### Overview Tab
- Database connectivity status
- Key metrics (symbols, portfolios, users)
- Data freshness alerts
- API health checks
- Error logs

#### Financial Sync Tab
- Trigger sync operations
- View sync progress
- Pending queue display
- Recent syncs history

#### Edge Functions Tab
- 150+ functions organized by category
- Test function invocation
- Execution logs

#### Database Tables Tab
- 90+ tables with row counts
- Data freshness indicators
- Category organization

#### APIs Tab
- External API health monitoring
- Response time tracking
- Status indicators

#### Logs Tab
- Real-time function logs
- Error aggregation
- Live feed toggle

### API Endpoints

```
GET  /api/admin/status     # System health
POST /api/admin/status     # Actions:
  - test-edge-function
  - sync-financials
  - watch-filings
  - sync-clinical-trials
  - discover-biotech
```

### Limitations

- No user management
- No content management
- Single password auth (no roles)
- No automated alerting

---

## 10. External Integrations

### Plaid (US Brokerages)

**Purpose:** Connect US brokerage accounts for portfolio sync

**Endpoints:**
```
POST /api/plaid/create-link-token
POST /api/plaid/exchange-token
GET  /api/plaid/get-investments
POST /api/plaid/webhook
```

**Environment:**
```
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=production  # or sandbox
```

### Tink (EU Banking)

**Purpose:** Connect European bank accounts

**Endpoints:**
```
POST /api/tink/create-link
GET  /api/tink/callback
GET  /api/tink/get-investments
POST /api/tink/webhook
```

**Environment:**
```
TINK_CLIENT_ID=...
TINK_CLIENT_SECRET=...
```

### SEC EDGAR

**Purpose:** Official SEC filings, XBRL data, 13F holdings

**Library:** `/src/lib/sec-edgar/`

**Functions:**
- `syncCompanyFinancials(cik, ticker)`
- `sync13FHoldings(cik, options)`
- `syncInsiderTrades(cik, ticker, options)`

### EODHD

**Purpose:** Market data, prices, fundamentals

**Environment:**
```
EODHD_API_KEY=...
```

### Financial Datasets

**Purpose:** Premium financial data API

**Environment:**
```
FINANCIAL_DATASETS_API_KEY=...
```

### ClinicalTrials.gov

**Purpose:** Clinical trial data for biotech stocks

**API:** Public REST API, no key required

### openFDA

**Purpose:** FDA drug approval data

**API:** Public REST API, no key required

---

## 11. Deployment

### Vercel Configuration

**Project:** quant-platform
**Team:** finance-liciancoms-projects

**Build:**
```bash
npm run build  # next build
```

**Environment Variables (Production):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
EODHD_API_KEY
PLAID_CLIENT_ID
PLAID_SECRET
TINK_CLIENT_ID
TINK_CLIENT_SECRET
ADMIN_PASSWORD
```

### Supabase Configuration

**Project:** wcckhqxkmhyzfpynthte
**Region:** (check dashboard)
**URL:** https://wcckhqxkmhyzfpynthte.supabase.co

**Required Extensions:**
- pg_cron (scheduling)
- pg_net (HTTP requests)
- uuid-ossp (UUID generation)

### Deployment Checklist

1. Push code to main branch
2. Vercel auto-deploys
3. Run database migrations: `supabase db push --linked`
4. Verify cron jobs: Check `cron.job` table
5. Test webhook endpoints
6. Monitor error logs

---

## 12. Troubleshooting

### Cron Jobs Not Running

**Symptom:** Data not updating, empty tables

**Diagnosis:**
```sql
-- Check if scheduler is alive
SELECT pid, application_name, state
FROM pg_stat_activity
WHERE application_name ILIKE 'pg_cron scheduler';

-- Check job run history
SELECT jobname, status, start_time, return_message
FROM cron.job_run_details
WHERE status != 'succeeded'
ORDER BY start_time DESC;
```

**Solutions:**
1. If scheduler dead: Fast Reboot in Supabase Settings
2. If jobs failing: Check endpoint URLs and parameters
3. If HTTP errors: Verify pg_net is enabled

### Database Connection Issues

**Symptom:** API errors, timeout

**Solutions:**
1. Check Supabase dashboard for outages
2. Verify connection pooling settings
3. Check for resource exhaustion

### Stripe Webhooks Failing

**Symptom:** Subscriptions not syncing

**Diagnosis:**
1. Check Stripe Dashboard > Webhooks
2. Look for failed deliveries
3. Verify webhook secret matches

**Solutions:**
1. Resend failed webhooks from Stripe
2. Check endpoint is accessible
3. Verify signature validation

### SEO Pages Not Indexed

**Symptom:** Low search visibility

**Solutions:**
1. Submit sitemaps to Google Search Console
2. Verify `generateMetadata()` is working
3. Check for noindex tags
4. Test with Google Rich Results Test

---

## 13. Known Issues & Fixes

### Issue: Cron Jobs Calling Wrong Endpoint (Fixed Dec 15, 2025)

**Problem:** Original cron jobs called `/api/admin/sync/financials` which requires a `cik` parameter, but jobs didn't provide it.

**Fix:** Migration `20251215000000_fix_cron_job_endpoints.sql`
- Changed to `/api/admin/sync/batch` which has built-in batch logic
- Old jobs unscheduled, new v2 jobs created

### Issue: Stock Page Missing SEO Metadata (Fixed Dec 15, 2025)

**Problem:** `/stock/[ticker]` was a client component with no `generateMetadata()`.

**Fix:** Converted to server component with full metadata generation.

### Issue: Missing Favicon Files (Fixed Dec 15, 2025)

**Problem:** No favicon.ico or apple-touch-icon.png

**Fix:** Created `/scripts/generate-favicons.js` and generated all sizes.

### Issue: No Global Structured Data (Fixed Dec 15, 2025)

**Problem:** Organization and WebSite schemas not in layout

**Fix:** Added to `layout.tsx` head section.

---

## 14. Future Recommendations

### High Priority

1. **Implement Paywall**
   - Create `usePremium()` hook
   - Gate AI features, historical data, institutional data
   - Add upgrade CTAs throughout app

2. **Add Monitoring/Alerting**
   - Set up alerts for cron failures
   - Monitor API error rates
   - Track subscription metrics

3. **Email Marketing**
   - Welcome sequence
   - Trial expiry reminders
   - Feature announcements

### Medium Priority

4. **Admin Dashboard Improvements**
   - User management CRUD
   - Subscription overrides
   - Cron job status viewer

5. **Performance Optimization**
   - Implement Redis caching
   - Optimize database queries
   - Add CDN for static assets

6. **Mobile App**
   - React Native app
   - RevenueCat integration ready
   - Push notifications

### Lower Priority

7. **API Tiering**
   - Rate limiting per plan
   - Usage metering
   - API key management

8. **Content Marketing**
   - Blog integration
   - Stock news aggregation
   - Educational content

9. **Social Features**
   - User watchlists sharing
   - Stock discussions
   - Portfolio leaderboards

---

## Appendix A: File Structure

```
quant-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (83 endpoints)
│   │   ├── stock/[ticker]/    # Stock pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── premium/           # Subscription pages
│   │   └── ...                # Other pages
│   ├── components/            # React components (71)
│   │   ├── ui/               # shadcn/ui components
│   │   └── seo/              # SEO components
│   └── lib/                   # Utilities
│       ├── seo.ts            # SEO helpers
│       ├── api.ts            # API client
│       └── sec-edgar/        # SEC data processing
├── supabase/
│   └── migrations/            # Database migrations (22)
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── og-image.png
│   └── robots.txt
├── scripts/                   # Utility scripts
│   ├── check-cron-status.js
│   └── generate-favicons.js
└── vercel.json               # Vercel config
```

---

## Appendix B: Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ANNUAL_PRICE_ID=price_...
STRIPE_MONTHLY_PRICE_ID=price_...

# Data APIs
EODHD_API_KEY=...
FINANCIAL_DATASETS_API_KEY=...

# Banking
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=production
TINK_CLIENT_ID=...
TINK_CLIENT_SECRET=...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Mobile
REVENUECAT_SECRET_KEY=...

# Admin
ADMIN_PASSWORD=...

# Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

---

## Appendix C: Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Run ESLint

# Supabase
supabase login                 # Authenticate
supabase link --project-ref xxx # Link project
supabase db push --linked      # Push migrations
supabase migration list --linked # Check migration status
supabase gen types typescript --linked > types/supabase.ts

# Scripts
node scripts/check-cron-status.js   # Diagnose cron jobs
node scripts/generate-favicons.js   # Generate favicons

# Git
git status
git add .
git commit -m "message"
git push origin main
```

---

*Documentation generated by Claude Code on December 15, 2025*
