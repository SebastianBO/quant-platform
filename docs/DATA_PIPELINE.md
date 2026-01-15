# Financial Data Pipeline

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

## Startup Checklist

When starting a session, always check:

```bash
# 1. Check scraper health
curl https://lician.com/api/monitoring/scraper-status

# 2. If critical issues, investigate cron job logs
# 3. Manually trigger failing syncs if needed
```

## Cron Jobs

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

## Key Files

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

## Database Tables

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

## Troubleshooting

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

## Data Flow Strategy

```
1. Supabase cache FIRST (free)
2. Paid API fallback ONLY if missing
3. Auto-cache paid results → free forever
4. Scrapers run continuously to minimize fallback usage
```

Goal: **Zero paid API calls** once all stocks are synced.

---

# EU Markets - Fully Operational (Jan 2026)

European financial data infrastructure is **production-ready** with **106,975 companies** and **48,592 financials** synced from FREE government APIs.

## Current Database Counts (Verified Jan 8, 2026)

| Table | Records | Coverage |
|-------|---------|----------|
| `eu_companies` | **106,975** | Norway, Denmark, Finland, Sweden |
| `eu_income_statements` | **48,592** | Full IFRS format financials |
| `eu_balance_sheets` | **48,592** | Full IFRS format financials |

## EU Data Architecture

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
└─────────────────────────────────────────────────────────────────────────┘
```

## EU Cron Jobs

| Endpoint | Country | Data Type | API Key Required | Status |
|----------|---------|-----------|------------------|--------|
| `/api/cron/sync-norwegian-companies` | Norway | 106K+ company profiles | **No** | ✅ Working |
| `/api/cron/sync-norwegian-financials` | Norway | 48K+ full financials | **No** | ✅ Working |
| `/api/cron/sync-danish-companies` | Denmark | Company + financials | **No** | ✅ Working |
| `/api/cron/sync-finnish-companies` | Finland | Company profiles | **No** | ✅ Working |
| `/api/cron/sync-swedish-stocks` | Sweden | 38 listed stocks | **No** | ✅ Working |
| `/api/cron/sync-german-companies` | Germany | 5M available | **No** | 🔧 API recovering |

## Bulk Sync Mode (Norwegian)

The Norwegian sync supports a bulk mode using kommune (municipality) + org form combinations:

```bash
# Trigger bulk sync - cycles through 70 combinations (10 kommuner × 7 org forms)
curl "https://lician.com/api/cron/sync-norwegian-companies?mode=bulk&limit=100&offset=0"

# Available modes: known, as, enk, nuf, sa, da, ans, asa, all, kommune, bulk
# Each combination can return up to 10K companies (Brreg API limit)
```

## EU Database Tables

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
```

## EU Data Sources Detail

### Norway (100% FREE, No API Key!) - 106K+ SYNCED

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

### Denmark (100% FREE, No API Key!)

**CVR - Central Business Register**
- Financials endpoint: `http://distribution.virk.dk/offentliggoerelser/_search`
- 2.2+ million Danish companies available
- **No authentication required for financials!**

### Finland (100% FREE, No API Key!)

**PRH - Patent and Registration Office**
- API: `https://avoindata.prh.fi/opendata-ytj-api/v3`
- 600K+ Finnish companies available
- Company form codes: OY (private), OYJ (public), KY, AY, OK

### Sweden (Yahoo Finance)

**Yahoo Finance v8 API**
- Endpoint: `https://query2.finance.yahoo.com/v8/finance/chart/{ticker}`
- 38 listed Swedish stocks (OMXS30 + extras)

### Germany (5M companies - API temporarily down)

**OffeneRegister.de**
- API: `https://db.offeneregister.de/openregister.json`
- 5+ million German companies
- Currently returning 502 - check periodically

## Environment Variables for EU

```bash
# UK Companies House (get free from gov.uk)
COMPANIES_HOUSE_API_KEY=your_key_here

# Norwegian APIs - NO KEY REQUIRED!
# Swedish - NO KEY REQUIRED (scraping)
```

## Testing EU Endpoints

```bash
# Test Norwegian companies (FREE, no key!)
curl https://lician.com/api/cron/sync-norwegian-companies?limit=5

# Test Norwegian financials (FREE, no key!)
curl https://lician.com/api/cron/sync-norwegian-financials?org=923609016
```

---

# SEC Bulk Data Import (Jan 8, 2026)

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

---

# Data Architecture: US vs EU (Decision Log)

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
2. **Create Unified View** - Map common fields for AI queries
3. **Smart AI Routing** - AI detects company region and queries appropriate table

**Recommendation:** Keep separate for data integrity. Create unified view only if AI query experience suffers.
