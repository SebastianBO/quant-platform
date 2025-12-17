# Lician Data Sync System

> Auto-syncs ALL SEC filings every 5 minutes. No manual intervention needed.

## How It Works

```
SEC EDGAR RSS → watch-sec-filings (every 5 min) → Database
     ↓
  Form 4 → insider_trades table
  8-K    → sec_filings table
  10-K/Q → income_statements, balance_sheets, cash_flow_statements
```

## Active Cron Jobs (38 total, 89% healthy)

### Primary Sync
| Job | Schedule | What It Syncs |
|-----|----------|---------------|
| `watch-sec-filings` | `*/5 * * * *` | ALL new SEC filings (Form 4, 8-K, 10-K, 10-Q) |

### Financial Data
| Job | Schedule | What It Syncs |
|-----|----------|---------------|
| `sync-short-volume-daily` | `30 21 * * 1-5` | FINRA short volume |
| `sync-financials-continuous` | `*/15 * * * *` | Financial statements |

### Institutional & Insider
| Job | Schedule | What It Syncs |
|-----|----------|---------------|
| `sync-13f-holdings-v2` | `0 6 * * *` | 13F institutional holdings |
| `sync-insider-trades-daily` | `0 15 * * 1-5` | Form 4 insider trades |
| `sync-8k-filings` | `15 */2 * * *` | 8-K material events |

### Biotech
| Job | Schedule | What It Syncs |
|-----|----------|---------------|
| `sync-clinical-trials-daily` | `0 6 * * *` | ClinicalTrials.gov data |
| `sync-biotech-data` | `0 6,18 * * *` | Biotech catalysts, PDUFA dates |

## Database Tables

| Table | Data | Updated By |
|-------|------|------------|
| `insider_trades` | Form 4 trades | watch-sec-filings, sync-insider-trades |
| `sec_filings` | 8-K, 10-K, 10-Q filings | watch-sec-filings, sync-8k-filings |
| `income_statements` | Income data | watch-sec-filings, sync-financials |
| `balance_sheets` | Balance sheet data | watch-sec-filings, sync-financials |
| `cash_flow_statements` | Cash flow data | watch-sec-filings, sync-financials |
| `short_volume` | FINRA short data | sync-short-volume |
| `institutional_holdings` | 13F holdings | sync-13f-holdings |
| `clinical_trials` | Trial data | sync-clinical-trials |
| `biotech_catalysts` | Biotech events | sync-biotech |

## No Duplicates

All syncs use `upsert` with unique keys:
- `accession_number` for SEC filings
- `cik + report_period + period` for financials
- `symbol + trade_date` for short volume

## Stock Page Data Sources

When viewing `/stock/AAPL`:

| Sidebar Tab | Database Table | API Endpoint |
|-------------|----------------|--------------|
| Insiders | `insider_trades` | `/api/v1/insider-trades` |
| Institutional | `institutional_holdings` | `/api/v1/institutional-ownership` |
| SEC Filings | `sec_filings` | `/api/v1/filings` |
| Short Volume | `short_volume` | `/api/short-volume` |
| Financials | `income_statements`, etc. | `/api/v1/financials` |
| Biotech | `clinical_trials`, `biotech_catalysts` | `/api/biotech-catalysts` |

## Monitoring

Check health: `npx tsx scripts/final-health-summary.ts`

View logs: Supabase Dashboard → Database → Tables → `cron_job_log`
