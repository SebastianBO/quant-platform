# Lician Financial Data Pipeline Documentation

## Overview

Lician has built a complete financial data infrastructure that replicates the functionality of FinancialDatasets.ai. The system uses **FREE data sources** (primarily SEC EDGAR) to populate a Supabase cache, with FinancialDatasets.ai as a paid fallback for missing data.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES (FREE)                              │
├──────────────────┬──────────────────┬──────────────────┬────────────────┤
│   SEC EDGAR      │  ClinicalTrials  │     FINRA        │   OpenFIGI     │
│  (Financials,    │     .gov         │  (Short Volume)  │   (Bonds)      │
│  Insider, 13F)   │  (Biotech)       │                  │                │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬───────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRON JOBS (Scheduled Sync)                        │
│  sync-financials | sync-insider-trades | sync-short-volume | sync-biotech│
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE (Cache)                               │
│  income_statements | balance_sheets | cash_flow_statements | insider_    │
│  trades | institutional_holdings | short_volume | clinical_trials | etc  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          v1 API ENDPOINTS                                │
│  Check Supabase first → If missing, fallback to FinancialDatasets.ai    │
│  /api/v1/financials/income-statements                                    │
│  /api/v1/financials/balance-sheets                                       │
│  /api/v1/insider-trades                                                  │
│  /api/v1/institutional-ownership                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SEC EDGAR Integration

### Overview
SEC EDGAR is the **primary free data source** for all company financial data. SEC provides:
- 10-K (Annual Reports)
- 10-Q (Quarterly Reports)
- Form 4 (Insider Trading)
- 13F-HR (Institutional Holdings)
- 8-K (Material Events)

### Rate Limits
- **10 requests/second** maximum
- Must include User-Agent header: `Lician contact@lician.com`

### Key Files
```
src/lib/sec-edgar/
├── client.ts           # SEC API client with rate limiting
├── sync.ts             # Orchestrates data sync to Supabase
├── financial-parser.ts # Parses XBRL data into normalized format
└── types.ts            # TypeScript interfaces
```

### SEC API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `https://data.sec.gov/submissions/CIK{cik}.json` | Company filing history |
| `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json` | All XBRL financial facts |
| `https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/` | Individual filing documents |

### How Financial Data is Parsed

The `financial-parser.ts` maps XBRL concepts to normalized fields:

```typescript
// Example: Revenue can be reported under different XBRL concepts
const INCOME_STATEMENT_CONCEPTS = {
  revenue: [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax', // ASC 606 (2018+)
    'SalesRevenueNet',
    'SalesRevenueGoodsNet',
  ],
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  eps: ['EarningsPerShareBasic'],
  epsDiluted: ['EarningsPerShareDiluted'],
  // ... 40+ fields mapped
}
```

### Sync Function

```typescript
// src/lib/sec-edgar/sync.ts
export async function syncCompanyFinancials(cik: string, ticker?: string): Promise<SyncResult> {
  // 1. Fetch XBRL data from SEC
  const facts = await getCompanyFacts(cik)

  // 2. Parse into normalized statements
  const incomeStatements = parseIncomeStatements(facts, ticker)
  const balanceSheets = parseBalanceSheets(facts, ticker)
  const cashFlowStatements = parseCashFlowStatements(facts, ticker)

  // 3. Upsert to Supabase
  for (const stmt of incomeStatements) {
    await supabase.from('income_statements').upsert(stmt, { onConflict: 'cik,report_period,period' })
  }
  // ... same for balance_sheets, cash_flow_statements
}
```

---

## Cron Jobs

### sync-financials (Primary)
**File:** `src/app/api/cron/sync-financials/route.ts`

**Schedule:**
- Priority mode: Every 6 hours (`0 */6 * * *`)
- Continue mode: Every hour at :30 (`30 * * * *`)

**Data Source:** SEC EDGAR (FREE)

**Tables Populated:**
- `income_statements`
- `balance_sheets`
- `cash_flow_statements`

**Modes:**
| Mode | Description |
|------|-------------|
| `priority` | Syncs 115+ high-traffic stocks (Mag 7, meme stocks, etc.) |
| `continue` | Syncs new stocks not yet in database |
| `all` | Syncs all ~10,196 SEC companies |
| `recent` | Re-syncs stocks with stale data |

**Usage:**
```bash
# Priority stocks
curl "https://lician.com/api/cron/sync-financials?mode=priority&limit=100"

# Continue syncing new stocks
curl "https://lician.com/api/cron/sync-financials?mode=continue&limit=200"

# All stocks (paginated)
curl "https://lician.com/api/cron/sync-financials?mode=all&offset=0&limit=500"
```

### sync-insider-trades
**File:** `src/app/api/cron/sync-insider-trades/route.ts`

**Data Source:** SEC EDGAR Form 4 (FREE)

**Table:** `insider_trades`

**Rate Limit:** 500ms between companies

### sync-8k-filings
**File:** `src/app/api/cron/sync-8k-filings/route.ts`

**Data Source:** SEC EDGAR RSS (FREE)

**Table:** `sec_filings`

**Purpose:** Tracks material events (earnings, M&A, executive changes)

### sync-short-volume
**File:** `src/app/api/cron/sync-short-volume/route.ts`

**Data Source:** FINRA (FREE)
```
https://cdn.finra.org/equity/regsho/daily/CNMSshvol{YYYYMMDD}.txt
```

**Table:** `short_volume`

### sync-biotech
**File:** `src/app/api/cron/sync-biotech/route.ts`

**Data Source:** ClinicalTrials.gov API (FREE)

**Tables:** `clinical_trials`, `biotech_catalysts`

### sync-analyst-estimates
**File:** `src/app/api/cron/sync-analyst-estimates/route.ts`

**Data Source:** FinancialDatasets.ai (PAID)

**Tables:** `analyst_estimates`, `price_targets`

---

## v1 API Endpoints

All endpoints follow the FinancialDatasets.ai API schema exactly.

### Pattern: Cache-First with Fallback

```typescript
// src/app/api/v1/financials/income-statements/route.ts
export async function GET(request: NextRequest) {
  // 1. Check Supabase cache
  const { data } = await supabase
    .from('income_statements')
    .select('*')
    .eq('ticker', ticker)
    .eq('period', period)
    .limit(limit)

  // 2. If cache hit, return immediately
  if (data && data.length > 0) {
    return { income_statements: data, _meta: { source: 'supabase' } }
  }

  // 3. Cache miss: Fallback to FinancialDatasets.ai
  const fallbackData = await fetchFromFinancialDatasets(ticker, period, limit)

  // 4. Auto-cache the fallback response
  if (fallbackData.length > 0) {
    await supabase.from('income_statements').upsert(fallbackData)
  }

  return { income_statements: fallbackData, _meta: { source: 'financialdatasets.ai' } }
}
```

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/v1/financials/income-statements` | Income statements (quarterly/annual) |
| `/api/v1/financials/balance-sheets` | Balance sheets |
| `/api/v1/financials/cash-flow-statements` | Cash flow statements |
| `/api/v1/financials/segmented-revenues` | Revenue by segment |
| `/api/v1/insider-trades` | Form 4 insider trading |
| `/api/v1/institutional-ownership` | 13F institutional holdings |
| `/api/v1/analyst-estimates` | EPS/revenue estimates |
| `/api/v1/analyst-ratings` | Buy/sell ratings |
| `/api/v1/prices/snapshot` | Real-time quotes |
| `/api/v1/company/facts` | Company metadata |

---

## Database Schema (Supabase)

### income_statements
```sql
CREATE TABLE income_statements (
  id SERIAL PRIMARY KEY,
  cik TEXT NOT NULL,
  ticker TEXT,
  report_period DATE NOT NULL,
  fiscal_period TEXT,           -- Q1, Q2, Q3, Q4, FY
  period TEXT NOT NULL,         -- quarterly, annual, ttm
  currency TEXT DEFAULT 'USD',

  -- Income Statement Fields
  revenue BIGINT,
  cost_of_revenue BIGINT,
  gross_profit BIGINT,
  operating_expense BIGINT,
  selling_general_and_administrative_expenses BIGINT,
  research_and_development BIGINT,
  operating_income BIGINT,
  interest_expense BIGINT,
  income_tax_expense BIGINT,
  net_income BIGINT,
  earnings_per_share DECIMAL(10,4),
  earnings_per_share_diluted DECIMAL(10,4),
  weighted_average_shares BIGINT,
  weighted_average_shares_diluted BIGINT,

  source TEXT,                  -- SEC_EDGAR or FINANCIAL_DATASETS
  updated_at TIMESTAMPTZ,

  UNIQUE(cik, report_period, period)
);
```

### insider_trades
```sql
CREATE TABLE insider_trades (
  id SERIAL PRIMARY KEY,
  ticker TEXT,
  company_cik TEXT,
  issuer TEXT,
  insider_cik TEXT,
  name TEXT,
  title TEXT,
  is_board_director BOOLEAN,
  transaction_date DATE,
  transaction_code TEXT,        -- P=Buy, S=Sell, M=Exercise, etc.
  transaction_type TEXT,        -- Buy, Sell, Grant, etc.
  transaction_shares INTEGER,
  transaction_price_per_share DECIMAL(12,4),
  transaction_value DECIMAL(16,2),
  shares_owned_after_transaction BIGINT,
  security_title TEXT,
  acquired_disposed_code TEXT,  -- A=Acquired, D=Disposed
  filing_date DATE,
  accession_number TEXT UNIQUE
);
```

### short_volume
```sql
CREATE TABLE short_volume (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  trade_date DATE NOT NULL,
  short_volume BIGINT,
  short_exempt_volume BIGINT,
  total_volume BIGINT,

  UNIQUE(symbol, trade_date)
);
```

---

## How to Sync All Stocks

### Option 1: Use Cron Jobs (Automated)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-financials?mode=priority&limit=100",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/sync-financials?mode=continue&limit=200",
      "schedule": "30 * * * *"
    }
  ]
}
```

At 200 stocks/hour = **4,800 stocks/day** = Full sync in ~1.5 days

### Option 2: Manual Bulk Sync
```bash
# Run the bulk sync script
npx tsx scripts/bulk-sync-financials.ts --continue

# Or with limits
npx tsx scripts/bulk-sync-financials.ts --limit 1000 --offset 2000
```

### Option 3: Trigger via API
```bash
# Sync specific tickers manually
curl -X POST https://lician.com/api/cron/sync-financials \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["AAPL", "MSFT", "GOOGL"]}'
```

---

## Priority Tickers List

The system prioritizes syncing high-traffic stocks first:

```typescript
const PRIORITY_TICKERS = [
  // Magnificent 7 + Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'AMD', 'INTC', 'CSCO', 'QCOM',

  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA',

  // Meme Stocks (high search volume)
  'GME', 'AMC', 'BB', 'NOK', 'PLTR', 'SOFI', 'LCID', 'RIVN', 'NIO',
  'HOOD', 'COIN', 'MARA', 'RIOT', 'CLSK',

  // AI Stocks
  'SMCI', 'ARM', 'SNOW', 'PATH', 'DDOG', 'NET', 'CRWD', 'ZS',

  // ... 115+ stocks total
]
```

---

## Auto-Caching Fallback Data

When a stock isn't in Supabase and is fetched from FinancialDatasets.ai, the response is automatically cached:

```typescript
// src/app/api/v1/financials/income-statements/route.ts
async function fetchFromFinancialDatasets(ticker: string, period: string, limit: number) {
  const response = await fetch(`https://api.financialdatasets.ai/financials/income-statements?ticker=${ticker}&period=${period}&limit=${limit}`, {
    headers: { 'X-API-Key': FINANCIAL_DATASETS_API_KEY }
  })

  const statements = (await response.json()).income_statements || []

  // AUTO-CACHE: Store in Supabase for future requests (fire and forget)
  if (statements.length > 0) {
    await supabase.from('income_statements').upsert(
      statements.map(s => ({ ...s, source: 'FINANCIAL_DATASETS', updated_at: new Date().toISOString() })),
      { onConflict: 'ticker,report_period,period' }
    )
  }

  return statements
}
```

**Result:** First request pays for FinancialDatasets.ai, all future requests are free from cache.

---

## Summary

| Component | Purpose | Cost |
|-----------|---------|------|
| SEC EDGAR | Financial statements, insider trades, 13F | FREE |
| ClinicalTrials.gov | Biotech catalysts | FREE |
| FINRA | Short volume data | FREE |
| OpenFIGI | Bond data | FREE |
| FinancialDatasets.ai | Fallback + analyst estimates | PAID |
| Supabase | Data cache | ~$25/mo |

**Total:** Most data is FREE from government sources. FinancialDatasets.ai is only used as fallback and for analyst data.
