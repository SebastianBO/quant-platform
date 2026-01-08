# Data Sources Architecture

## Overview

Lician aims to have comprehensive financial data for ALL publicly traded companies in US and EU.

## US Data (SEC EDGAR)

### Bulk Download (Primary)
- **URL**: `https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip`
- **Size**: ~1.34 GB
- **Contents**: ALL XBRL financial data for ALL 10,312 US companies
- **Update**: Quarterly
- **Processing**: Run `npx tsx scripts/process-sec-bulk.ts` locally

### API (Incremental)
- **Rate Limit**: 10 requests/second
- **Endpoint**: `/api/cron/sync-financials`
- **Use Case**: Daily updates for new filings

### Coverage
| Data Type | Source | Companies |
|-----------|--------|-----------|
| Income Statements | SEC EDGAR | 10,312 |
| Balance Sheets | SEC EDGAR | 10,312 |
| Cash Flow Statements | SEC EDGAR | 10,312 |
| Insider Trades | SEC Form 4 | 10,312 |
| Institutional Holdings | SEC 13F | 10,312 |
| 8-K Filings | SEC EDGAR | 10,312 |

## UK Data (Companies House)

### Bulk Download
- **Free Accounts Data**: https://download.companieshouse.gov.uk/en_accountsdata.html
  - Daily iXBRL/XBRL files
  - ~500 MB compressed
- **Free Company Data**: https://download.companieshouse.gov.uk/en_output.html
  - All 4.5M UK companies
  - CSV format

### API
- **URL**: https://developer.company-information.service.gov.uk/
- **Auth**: Free API key required
- **Rate Limit**: 600 requests/5 minutes

### Coverage
| Data Type | Source | Companies |
|-----------|--------|-----------|
| Company Info | Companies House | 4,500,000 |
| Accounts Data | Companies House | ~2,000 (publicly traded) |
| Directors | Companies House | 4,500,000 |

## EU Data (Other Countries)

### Germany
- **Bundesanzeiger**: https://www.bundesanzeiger.de/
  - Annual reports for German companies
  - Requires scraping
- **Deutsche Börse**: Listed companies only

### France
- **Open Data API**: https://data.gouv.fr/
- **Infogreffe**: Commercial court registry

### Netherlands
- **KvK (Chamber of Commerce)**: https://developers.kvk.nl/

### Sweden
- **Bolagsverket**: https://bolagsverket.se/

### Pan-European
- **OpenCorporates**: https://opencorporates.com/
  - Aggregates data from 140+ jurisdictions
  - API available (paid for bulk)
- **SimFin**: https://simfin.com/
  - Free financial data for major companies
- **EOD Historical Data**: https://eodhd.com/
  - EU stock exchanges supported

## Implementation Priority

### Phase 1: US Complete ✅ (In Progress)
1. Run SEC bulk import
2. Set up incremental sync
3. Target: 10,312 companies

### Phase 2: UK
1. Download Companies House bulk data
2. Process accounts data
3. Target: ~2,000 publicly traded

### Phase 3: Major EU Markets
1. Germany (DAX + MDAX + SDAX = ~200 companies)
2. France (CAC 40 + SBF 120 = ~120 companies)
3. Netherlands (AEX = ~25 companies)
4. Sweden (OMX Stockholm = ~350 companies)

### Phase 4: Full EU Coverage
1. All EU exchanges
2. ~5,000 publicly traded companies total

## Data Pipeline

```
Bulk Downloads (Initial Load)
         ↓
    Supabase DB
         ↓
   API Endpoints
         ↓
 Incremental Sync (Daily)
         ↓
    AI Research Agent
```

## Running Bulk Import

### US (SEC)
```bash
# Download and process all 10,312 US companies
npx tsx scripts/process-sec-bulk.ts
```

### UK (Companies House)
```bash
# Download and process UK companies
npx tsx scripts/process-uk-bulk.ts
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# UK Companies House
COMPANIES_HOUSE_API_KEY=

# Optional: Paid services for additional data
EODHD_API_KEY=
FINANCIAL_DATASETS_API_KEY=
```
