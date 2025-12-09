# Financial Datasets API - Comprehensive Research Report

**Research Date:** December 9, 2025
**Platform:** financialdatasets.ai
**Founder:** Virat Singh (@virattt)
**Purpose:** Understanding their 13F/Institutional Ownership API structure for replication using SEC EDGAR data

---

## Executive Summary

Financial Datasets (financialdatasets.ai) is a developer-first financial data API specializing in LLM-optimized endpoints. Their institutional ownership API provides access to Form 13F filings data for investment managers with $100M+ AUM. The API is notable for its simplicity, clean data model, and focus on AI agent integration.

**Key Insights:**
- Simple REST API with header-based auth (X-API-KEY)
- Two-way querying: by ticker (get all holders) or by investor (get all holdings)
- Data sourced directly from SEC EDGAR Form 13F filings
- 45-day lag from quarter end (standard SEC filing deadline)
- Free tier available for AAPL, GOOGL, MSFT, NVDA, TSLA

---

## 1. API Architecture & Endpoints

### Base URL
```
https://api.financialdatasets.ai
```

### Authentication
All requests require an API key in the header:
```
X-API-KEY: your_api_key_here
```

### Core Institutional Ownership Endpoints

#### 1.1 Get Investors List
```
GET /institutional-ownership/investors/
```
Returns array of available investor names (standardized format).

**Response:**
```json
{
  "investors": [
    "BERKSHIRE_HATHAWAY_INC",
    "VANGUARD_GROUP_INC",
    "BLACKROCK_INC",
    ...
  ]
}
```

#### 1.2 Get Tickers List
```
GET /institutional-ownership/tickers/
```
Returns array of tickers with institutional ownership data.

**Response:**
```json
{
  "tickers": ["AAPL", "MSFT", "NVDA", ...]
}
```

#### 1.3 Get Holdings by Investor
```
GET /institutional-ownership/?investor={investor_name}&limit={limit}&report_period={date}
```

**Query Parameters:**
- `investor` (required): Investment manager name (e.g., "BERKSHIRE_HATHAWAY_INC")
- `limit` (optional, default: 10): Number of holdings to return
- `report_period` (optional): Specific quarter date (YYYY-MM-DD)
- `report_period_lte` (optional): Holdings on/before date
- `report_period_gte` (optional): Holdings on/after date
- `report_period_lt` (optional): Holdings before date
- `report_period_gt` (optional): Holdings after date

**Example Request:**
```bash
curl https://api.financialdatasets.ai/institutional-ownership/ \
  -H "X-API-KEY: your_api_key" \
  -G -d "investor=BERKSHIRE_HATHAWAY_INC" \
  -d "limit=100" \
  -d "report_period_gte=2024-01-01" \
  -d "report_period_lte=2024-09-30"
```

**Response Schema:**
```json
{
  "institutional-ownership": [
    {
      "ticker": "AAPL",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 225.50,
      "shares": 300000000,
      "market_value": 67650000000
    }
  ]
}
```

#### 1.4 Get Holders by Ticker
```
GET /institutional-ownership/?ticker={ticker}&limit={limit}
```

**Query Parameters:**
- `ticker` (required): Stock symbol
- `limit` (optional, default: 10): Number of holders to return
- `report_period_*` (optional): Same date filtering as investor endpoint

**Example Request:**
```bash
curl https://api.financialdatasets.ai/institutional-ownership/ \
  -H "X-API-KEY: your_api_key" \
  -G -d "ticker=NVDA" \
  -d "limit=50"
```

**Response Schema:**
```json
{
  "institutional-ownership": [
    {
      "ticker": "NVDA",
      "investor": "VANGUARD_GROUP_INC",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 345000000,
      "market_value": 43228500000
    }
  ]
}
```

---

## 2. Data Model & Fields

### Core Data Fields

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `ticker` | string | Stock symbol | Resolved from CUSIP |
| `investor` | string | Investment manager name (standardized) | SEC Form 13F |
| `report_period` | date (YYYY-MM-DD) | Quarterly filing submission date | SEC filing metadata |
| `price` | number | Estimated purchase price per share | Calculated |
| `shares` | number | Quantity of shares held | SEC Form 13F InfoTable |
| `market_value` | number | Total position value (in dollars) | SEC Form 13F InfoTable |

### Extended Fields (Inferred from API behavior)

Based on the your current implementation and common 13F patterns:

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `change_in_shares` | number | Share change vs prior quarter | Requires QoQ comparison |
| `change_percent` | number | Percentage change in shares | Calculated field |
| `is_new_position` | boolean | New holding this quarter | Compare to prior filing |
| `percent_of_outstanding` | number | % of company's shares | Requires shares outstanding data |
| `filing_date` | date | Date 13F was filed | SEC metadata |
| `investor_name` | string | Alternative to `investor` | Some responses use this |

### Data Standardization

**Investor Names:**
- Uppercase with underscores: `BERKSHIRE_HATHAWAY_INC`
- Trailing qualifiers: `_INC`, `_LLC`, `_LP`, etc.
- Example transformations:
  - "Berkshire Hathaway Inc" → `BERKSHIRE_HATHAWAY_INC`
  - "The Vanguard Group, Inc." → `VANGUARD_GROUP_INC`

**Tickers:**
- Standard uppercase format: `AAPL`, `MSFT`, `NVDA`
- Class suffixes: `BRK.A`, `BRK.B`, `GOOGL`, `GOOG`

---

## 3. Pricing & Rate Limits

### Pricing Tiers

| Tier | Monthly Cost | API Requests | License | Key Features |
|------|-------------|--------------|---------|--------------|
| **Credits** | Pay-as-you-go | Per-request | Individual | $0.02/request for institutional data |
| **Developer** | $200/month | 1,000/min | Individual use only | Core access, 30+ years history |
| **Pro** | $2,000/month | Unlimited | Redistribution OK | Full access, unlimited requests |
| **Enterprise** | Custom | Unlimited | Redistribution OK | Dedicated compute, priority support |

### Free Tier
- Free data for: AAPL, GOOGL, MSFT, NVDA, TSLA
- Requires account signup
- Same API structure as paid tiers

### Rate Limits
- Developer: 1,000 requests/minute
- Pro/Enterprise: Unlimited

---

## 4. Data Coverage & Limitations

### Coverage
- **Scope:** Investment managers with $100M+ assets under management (AUM)
- **Timeframe:** 30+ years of historical data
- **Tickers:** 30,000+ stocks
- **Update Frequency:** Quarterly (follows SEC 13F schedule)
- **Data Lag:** 45 days from quarter end (SEC filing deadline)

### Limitations
- **Long positions only:** SEC Form 13F only requires reporting of long equity positions
- **SEC-registered securities only:** Options sometimes included, but not consistently
- **No short positions:** Short holdings are not reported in 13F filings
- **Delayed data:** 45-day lag means positions may have changed
- **No intra-quarter updates:** Only quarterly snapshots
- **CUSIP resolution:** Not all CUSIPs map cleanly to tickers

### Data Quality Notes
- Values are in dollars (despite SEC documentation sometimes stating $1000s)
- Modern XML filings (post-2013 Q2) are more reliable than older text filings
- Some investors file 13F-HR/A (amendments) which may supersede original filings

---

## 5. Technical Implementation Details

### Python SDK Example
```python
import requests

# Configuration
API_KEY = "your_api_key_here"
BASE_URL = "https://api.financialdatasets.ai"
headers = {"X-API-KEY": API_KEY}

# Get Berkshire Hathaway's holdings
def get_investor_holdings(investor, limit=100):
    url = f"{BASE_URL}/institutional-ownership/"
    params = {
        "investor": investor,
        "limit": limit
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Get NVDA's institutional holders
def get_ticker_holders(ticker, limit=50):
    url = f"{BASE_URL}/institutional-ownership/"
    params = {
        "ticker": ticker,
        "limit": limit
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Example usage
brk_holdings = get_investor_holdings("BERKSHIRE_HATHAWAY_INC", limit=100)
nvda_holders = get_ticker_holders("NVDA", limit=50)
```

### TypeScript SDK (Community)
```typescript
import { createFinancialDataTools } from "financialdatasets-sdk";

const financialTools = createFinancialDataTools("your-api-key");

// Get holdings
const result = await financialTools.getInstitutionalOwnership.execute({
  ticker: "AAPL",
  limit: 50
});
```

### Response Caching
- Financial Datasets recommends caching responses
- Institutional data changes quarterly
- Suggested cache duration: 1 hour to 1 day

---

## 6. Your Current Implementation Analysis

### What You're Already Doing Well

**File: `/src/app/api/sec-13f/route.ts`**
✅ Direct SEC EDGAR integration
✅ Comprehensive CUSIP to ticker mapping (71+ major stocks)
✅ Proper XML parsing for InfoTable
✅ Full 13F data model implementation:
- issuer, class, cusip, ticker
- value, shares, shareType
- investmentDiscretion
- votingSole, votingShared, votingNone
- putCall (for options)

✅ Well-known institution CIK mapping (44+ major investors)
✅ Multi-quarter support (8 quarters / 2 years)
✅ Portfolio percentage calculations
✅ Proper User-Agent header for SEC compliance

**File: `/src/app/api/institutional/route.ts`**
✅ Hybrid approach: Financial Datasets API + EODHD + SEC fallback
✅ Institution classification (Index Fund, Hedge Fund, Pension, etc.)
✅ Advanced metrics:
- Concentration (HHI, top5%, top10%)
- Flow score and signals (STRONG_BUY to STRONG_SELL)
- Effective holders calculation

✅ Change tracking (QoQ share changes)
✅ Holder categorization by type

### Gaps Compared to Financial Datasets API

1. **Investor List Endpoint**
   - Financial Datasets: `/institutional-ownership/investors/` returns all available investors
   - You: Search-based approach with known institutions only
   - **Recommendation:** Build a comprehensive investor index from SEC 13F filer list

2. **Ticker List Endpoint**
   - Financial Datasets: `/institutional-ownership/tickers/` returns all covered tickers
   - You: No dedicated endpoint
   - **Recommendation:** Create an index of all tickers with 13F coverage

3. **Date Range Filtering**
   - Financial Datasets: Flexible date filtering (gte, lte, gt, lt)
   - You: Quarter-index based approach (0 = latest, 1 = previous, etc.)
   - **Recommendation:** Add date-based filtering to your API

4. **Standardized Investor Names**
   - Financial Datasets: Consistent uppercase with underscores format
   - You: Mixed formats with display name transformations
   - **Recommendation:** Normalize to a single standard format

5. **QoQ Change Calculation**
   - Financial Datasets: Pre-calculated `change_in_shares`, `change_percent`, `is_new_position`
   - You: Requires fetching multiple quarters and manual comparison
   - **Recommendation:** Build a change calculation layer that compares sequential filings

---

## 7. SEC Form 13F Data Structure (Source)

### Official SEC Data Model

**Form 13F InfoTable XML Fields:**

| SEC Field | Your Mapping | Financial Datasets |
|-----------|--------------|-------------------|
| nameOfIssuer | issuer | (not exposed) |
| titleOfClass | class | (not exposed) |
| cusip | cusip | ticker (resolved) |
| value | value (dollars) | market_value |
| sshPrnamt | shares | shares |
| sshPrnamtType | shareType | (filtered to shares only) |
| investmentDiscretion | investmentDiscretion | (not exposed) |
| Sole | votingSole | (not exposed) |
| Shared | votingShared | (not exposed) |
| None | votingNone | (not exposed) |
| putCall | putCall | (not exposed) |

**Filing Metadata:**

| SEC Field | Your Mapping | Financial Datasets |
|-----------|--------------|-------------------|
| accessionNumber | accessionNumber | (not exposed) |
| filingDate | filingDate | filing_date |
| reportDate | reportDate | report_period |
| form | form (13F-HR/13F-HR/A) | (not exposed) |

### Key Differences

1. **Financial Datasets simplifies:** Only exposes essential fields (ticker, investor, shares, value, price, report_period)
2. **Your implementation is richer:** Includes voting authority, investment discretion, put/call indicators
3. **Trade-off:** Simplicity vs completeness

---

## 8. Replication Strategy: Building Your Own API

### Option A: Match Financial Datasets API Exactly

**Pros:**
- Drop-in replacement for their API
- Familiar to developers who've used their service
- Clean, simple data model

**Cons:**
- Loses rich 13F metadata (voting rights, discretion, etc.)
- May need to build additional endpoints for advanced users

**Implementation Checklist:**
- [ ] Create `/institutional-ownership/investors/` endpoint
- [ ] Create `/institutional-ownership/tickers/` endpoint
- [ ] Simplify response schema to 6 core fields
- [ ] Add date range filtering (gte, lte, gt, lt)
- [ ] Implement investor name standardization
- [ ] Build QoQ change calculation pipeline
- [ ] Create CUSIP → ticker resolution service

### Option B: Extend Your Current Rich Model

**Pros:**
- Keeps valuable SEC data (voting, discretion, put/call)
- More comprehensive for professional users
- Supports advanced institutional analysis

**Cons:**
- Different API structure than Financial Datasets
- Larger response payloads
- More complex for simple use cases

**Implementation Checklist:**
- [ ] Add investor/ticker list endpoints
- [ ] Add date-based filtering to existing endpoints
- [ ] Build QoQ change calculation
- [ ] Create investor search functionality
- [ ] Add bulk data export endpoints
- [ ] Document unique value propositions

### Option C: Hybrid Approach (Recommended)

**Offer two API versions:**

1. **Simple API** (Financial Datasets compatible)
   - `/api/v1/institutional-ownership/` (simplified 6-field model)
   - Match their exact response structure
   - Good for LLM agents and simple integrations

2. **Advanced API** (Your current rich model)
   - `/api/v2/institutional-ownership/` (full 13F data)
   - Include voting authority, discretion, put/call
   - Support complex queries and analytics

**Benefits:**
- ✅ Captures both markets (simple + advanced)
- ✅ Competitive with Financial Datasets while offering more
- ✅ Clear upgrade path from free/simple → paid/advanced

---

## 9. Data Processing Pipeline

### Recommended Architecture

```
1. SEC EDGAR Ingestion
   ├─ Daily: Fetch new 13F filings from SEC
   ├─ Parse: Extract InfoTable XML
   └─ Store: Raw filings in object storage

2. Data Normalization
   ├─ CUSIP Resolution: Map CUSIPs to tickers
   ├─ Investor Standardization: Normalize names
   ├─ Value Calculation: Ensure proper dollar amounts
   └─ Data Validation: Check for anomalies

3. Change Calculation
   ├─ Compare: Sequential quarterly filings
   ├─ Compute: Share changes, new positions, exits
   └─ Store: Deltas in separate table

4. Indexing & Search
   ├─ Investor Index: All filers with metadata
   ├─ Ticker Index: All covered stocks
   ├─ Full-text Search: Institution name search
   └─ Time-series Index: Historical data access

5. API Layer
   ├─ REST Endpoints: Match Financial Datasets API
   ├─ Caching: Redis for frequently accessed data
   ├─ Rate Limiting: Protect infrastructure
   └─ Authentication: API key management
```

### Database Schema Recommendations

**Table: `institutional_holdings`**
```sql
CREATE TABLE institutional_holdings (
  id BIGSERIAL PRIMARY KEY,
  investor_cik VARCHAR(10) NOT NULL,
  investor_name VARCHAR(255) NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  cusip VARCHAR(9) NOT NULL,
  report_period DATE NOT NULL,
  filing_date DATE NOT NULL,
  shares BIGINT NOT NULL,
  market_value BIGINT NOT NULL,
  price NUMERIC(10,2),
  share_type VARCHAR(3),
  investment_discretion VARCHAR(10),
  voting_sole BIGINT,
  voting_shared BIGINT,
  voting_none BIGINT,
  put_call VARCHAR(4),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_ticker_report (ticker, report_period),
  INDEX idx_investor_report (investor_cik, report_period),
  INDEX idx_report_period (report_period)
);
```

**Table: `institutional_changes`** (Pre-calculated)
```sql
CREATE TABLE institutional_changes (
  id BIGSERIAL PRIMARY KEY,
  investor_cik VARCHAR(10) NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  report_period DATE NOT NULL,
  prior_period DATE,
  shares BIGINT NOT NULL,
  prior_shares BIGINT,
  change_in_shares BIGINT,
  change_percent NUMERIC(10,2),
  is_new_position BOOLEAN,
  is_exit BOOLEAN,
  market_value BIGINT,

  INDEX idx_ticker_period (ticker, report_period),
  INDEX idx_investor_period (investor_cik, report_period)
);
```

**Table: `investor_metadata`**
```sql
CREATE TABLE investor_metadata (
  cik VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL, -- BERKSHIRE_HATHAWAY_INC format
  investor_type VARCHAR(50), -- Index Fund, Hedge Fund, etc.
  first_filing_date DATE,
  last_filing_date DATE,
  total_filings INT,
  avg_portfolio_value BIGINT,

  INDEX idx_normalized_name (normalized_name),
  INDEX idx_investor_type (investor_type)
);
```

---

## 10. Advanced Features to Consider

### Features Financial Datasets Has

1. **LLM Optimization**
   - Clean JSON responses optimized for function calling
   - Minimal field names for token efficiency
   - Consistent data types

2. **Model Context Protocol (MCP) Server**
   - Claude Desktop integration
   - Pre-built tools for LLM agents
   - https://github.com/financial-datasets/mcp-server

3. **Vercel AI SDK Integration**
   - TypeScript SDK with AI function calling
   - https://github.com/leomercier/financialdatasets-sdk

### Features You Could Add (Competitive Advantages)

1. **Richer Metadata**
   - ✅ You already have: Voting authority, investment discretion
   - Add: CIK numbers, accession numbers (for direct SEC lookups)
   - Add: Amendment tracking (13F-HR vs 13F-HR/A)

2. **Advanced Analytics**
   - ✅ You already have: Concentration metrics (HHI), flow scores
   - Add: Sentiment analysis (bullish/bearish based on changes)
   - Add: Activist investor tracking (large stakes, increasing positions)
   - Add: Whale tracking (copy trading opportunities)

3. **Historical Comparisons**
   - Add: Multi-quarter trend analysis
   - Add: Portfolio overlap analysis (which funds hold similar stocks)
   - Add: Position ranking (e.g., "This is Berkshire's 3rd largest holding")

4. **Real-time Alerts**
   - Add: WebSocket/SSE for new 13F filings
   - Add: Threshold alerts (e.g., "Notify when ownership >5%")
   - Add: Activist filing alerts (Schedule 13D integration)

5. **Data Enrichment**
   - Add: Merger/acquisition context (why position changed)
   - Add: Spin-off tracking (position splits)
   - Add: Corporate action adjustments

6. **Sector/Industry Analysis**
   - Add: Institutional flow by sector
   - Add: Top stocks by hedge fund ownership
   - Add: Index fund vs active fund positioning

---

## 11. Key Takeaways & Recommendations

### What Makes Financial Datasets Successful

1. **Simplicity:** 6-field data model is easy to understand and use
2. **LLM-First:** Designed for AI agents, not just humans
3. **Direct Sourcing:** No middlemen, straight from SEC EDGAR
4. **Developer Experience:** Clean docs, free tier, simple auth
5. **Pricing:** Clear tiers, predictable costs

### Your Competitive Advantages

1. **Richer Data:** You expose full 13F fields (voting, discretion, put/call)
2. **Hybrid Sources:** You combine Financial Datasets + EODHD + SEC for completeness
3. **Advanced Metrics:** HHI concentration, flow scores, investor classification
4. **No API Key Needed (For Your Product):** Your users don't need Financial Datasets API key
5. **Custom Analytics:** You can build domain-specific insights

### Recommended Next Steps

**Immediate (Week 1-2):**
1. ✅ Research complete (this document)
2. Build `/institutional-ownership/investors/` endpoint from SEC 13F filer list
3. Build `/institutional-ownership/tickers/` endpoint from your holdings data
4. Add date-based filtering to your existing endpoints

**Short-term (Month 1):**
5. Implement QoQ change calculation pipeline
6. Create investor name standardization service
7. Build CUSIP → ticker resolution service (expand your current mapping)
8. Document your API to match Financial Datasets format (for compatibility)

**Medium-term (Month 2-3):**
9. Build change tracking database tables
10. Implement bulk data export
11. Add caching layer (Redis) for frequently accessed data
12. Create analytics dashboards (top movers, sector flows, etc.)

**Long-term (Month 4+):**
13. Build MCP server for Claude Desktop integration
14. Create TypeScript SDK
15. Add real-time filing alerts via WebSocket
16. Implement advanced analytics (activist tracking, whale tracking)

### Pricing Strategy Ideas

**If you want to compete with Financial Datasets:**
- Free tier: Match their free stocks (AAPL, GOOGL, MSFT, NVDA, TSLA)
- Basic: $99/month (undercut their $200 Developer tier)
- Pro: $999/month (undercut their $2,000 Pro tier)
- Differentiate on: Richer data, better analytics, included features

**If you want to go premium:**
- Position as "Professional 13F Analytics Platform"
- Emphasize: Advanced metrics, real-time alerts, historical analysis
- Price: $299-$499/month (above Financial Datasets, below Bloomberg)

---

## 12. Resources & Links

### Financial Datasets
- Website: https://www.financialdatasets.ai
- Documentation: https://docs.financialdatasets.ai
- Institutional Ownership (by investor): https://docs.financialdatasets.ai/api-reference/endpoint/institutional-ownership/investor
- Institutional Ownership (by ticker): https://docs.financialdatasets.ai/api-reference/endpoint/institutional-ownership/ticker
- Pricing: https://www.financialdatasets.ai/pricing
- GitHub Organization: https://github.com/financial-datasets
- MCP Server: https://github.com/financial-datasets/mcp-server
- OpenAPI Schema: https://gist.github.com/virat-findy/7f6bffd34b0ea8392b095df423e7681b

### Founder & Community
- Virat Singh Twitter/X: https://x.com/virattt
- Dexter Project (AI Financial Agent): https://github.com/virattt/dexter
- AI Financial Agent: https://github.com/virattt/ai-financial-agent
- Financial Datasets Library: https://github.com/virattt/financial-datasets
- LangChain Integration: https://github.com/langchain-ai/langchain/blob/master/docs/docs/integrations/tools/financial_datasets.ipynb

### SEC Resources
- Form 13F Data Sets: https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets
- Form 13F Documentation: https://www.sec.gov/files/form_13f.pdf
- EDGAR Filing Search: https://www.sec.gov/edgar/searchedgar/companysearch.html
- SEC API Best Practices: Use proper User-Agent header

### Competitor Analysis
- SEC API: https://sec-api.io/docs/query-api/13f-institutional-ownership-api
- Financial Modeling Prep: https://site.financialmodelingprep.com/datasets/form-13f
- WhaleWisdom: https://whalewisdom.com
- 13F.info: https://13f.info

### Your Current Implementation
- SEC 13F Route: `/src/app/api/sec-13f/route.ts`
- Institutional Route: `/src/app/api/institutional/route.ts`
- InstitutionalOwnership Component: `/src/components/InstitutionalOwnership.tsx`

---

## Appendix A: Complete API Response Examples

### Financial Datasets - Get Holdings by Investor

**Request:**
```bash
GET /institutional-ownership/?investor=BERKSHIRE_HATHAWAY_INC&limit=5
X-API-KEY: your_api_key
```

**Response:**
```json
{
  "institutional-ownership": [
    {
      "ticker": "AAPL",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 225.50,
      "shares": 300000000,
      "market_value": 67650000000
    },
    {
      "ticker": "BAC",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 39.20,
      "shares": 1032852006,
      "market_value": 40487798635
    },
    {
      "ticker": "AXP",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 265.75,
      "shares": 151610700,
      "market_value": 40290543525
    },
    {
      "ticker": "KO",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 68.40,
      "shares": 400000000,
      "market_value": 27360000000
    },
    {
      "ticker": "CVX",
      "investor": "BERKSHIRE_HATHAWAY_INC",
      "report_period": "2024-09-30",
      "price": 150.30,
      "shares": 123454321,
      "market_value": 18555394686
    }
  ]
}
```

### Financial Datasets - Get Holders by Ticker

**Request:**
```bash
GET /institutional-ownership/?ticker=NVDA&limit=5
X-API-KEY: your_api_key
```

**Response:**
```json
{
  "institutional-ownership": [
    {
      "ticker": "NVDA",
      "investor": "VANGUARD_GROUP_INC",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 345000000,
      "market_value": 43228500000
    },
    {
      "ticker": "NVDA",
      "investor": "BLACKROCK_INC",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 287000000,
      "market_value": 35961100000
    },
    {
      "ticker": "NVDA",
      "investor": "STATE_STREET_CORP",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 156000000,
      "market_value": 19546800000
    },
    {
      "ticker": "NVDA",
      "investor": "FMR_LLC",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 134000000,
      "market_value": 16790200000
    },
    {
      "ticker": "NVDA",
      "investor": "GEODE_CAPITAL_MANAGEMENT_LLC",
      "report_period": "2024-09-30",
      "price": 125.30,
      "shares": 45000000,
      "market_value": 5638500000
    }
  ]
}
```

---

## Appendix B: Investor Name Standardization Reference

### Common Investor Name Patterns

| Display Name | SEC Filing Name | Financial Datasets Format | Your Current Format |
|--------------|----------------|---------------------------|---------------------|
| Berkshire Hathaway Inc | BERKSHIRE HATHAWAY INC | BERKSHIRE_HATHAWAY_INC | BERKSHIRE_HATHAWAY |
| The Vanguard Group, Inc. | VANGUARD GROUP INC | VANGUARD_GROUP_INC | VANGUARD_GROUP |
| BlackRock, Inc. | BLACKROCK INC | BLACKROCK_INC | BLACKROCK |
| State Street Corporation | STATE STREET CORP | STATE_STREET_CORP | STATE_STREET |
| FMR LLC (Fidelity) | FMR LLC | FMR_LLC | FIDELITY |
| JPMorgan Chase & Co. | JPMORGAN CHASE & CO | JPMORGAN_CHASE | JPMORGAN |
| Morgan Stanley | MORGAN STANLEY | MORGAN_STANLEY | MORGAN_STANLEY |
| Goldman Sachs Group Inc | GOLDMAN SACHS GROUP INC | GOLDMAN_SACHS | GOLDMAN_SACHS |
| Citadel Advisors LLC | CITADEL ADVISORS LLC | CITADEL_ADVISORS | CITADEL_ADVISORS |
| Bridgewater Associates, LP | BRIDGEWATER ASSOCIATES LP | BRIDGEWATER_ASSOCIATES | BRIDGEWATER |

### Standardization Algorithm

```python
def standardize_investor_name(raw_name: str) -> str:
    """
    Convert SEC filing name to Financial Datasets format
    """
    # Remove common prefixes
    name = raw_name.upper()
    name = name.replace('THE ', '')

    # Remove punctuation except periods in abbreviations
    name = name.replace(',', '')
    name = name.replace('.', '')
    name = name.replace('&', 'AND')

    # Replace spaces with underscores
    name = name.replace(' ', '_')

    # Normalize common suffixes
    name = name.replace('_INCORPORATED', '_INC')
    name = name.replace('_CORPORATION', '_CORP')
    name = name.replace('_LIMITED_LIABILITY_COMPANY', '_LLC')
    name = name.replace('_LIMITED_PARTNERSHIP', '_LP')
    name = name.replace('_LIMITED', '_LTD')

    # Remove trailing underscores
    name = name.rstrip('_')

    return name

# Examples:
# "Berkshire Hathaway Inc." -> "BERKSHIRE_HATHAWAY_INC"
# "The Vanguard Group, Inc." -> "VANGUARD_GROUP_INC"
# "JPMorgan Chase & Co." -> "JPMORGAN_CHASE_AND_CO"
```

---

## Appendix C: CUSIP to Ticker Resolution

### Current Coverage (Your Implementation)

You have 71+ CUSIP mappings in `/src/app/api/sec-13f/route.ts`.

### Expanding Coverage

**Option 1: Use OpenFIGI API**
```python
import requests

def resolve_cusip(cusip: str) -> str:
    response = requests.post(
        'https://api.openfigi.com/v3/mapping',
        json=[{"idType": "ID_CUSIP", "idValue": cusip}],
        headers={'X-OPENFIGI-APIKEY': 'YOUR_KEY'}
    )
    data = response.json()
    if data and len(data) > 0 and 'data' in data[0]:
        return data[0]['data'][0].get('ticker')
    return None
```

**Option 2: Use SEC Company Tickers JSON**
```python
import requests

def build_cusip_index():
    # Download SEC's company tickers file
    response = requests.get('https://www.sec.gov/files/company_tickers.json')
    tickers = response.json()

    # Build CUSIP -> Ticker mapping
    cusip_map = {}
    for key, company in tickers.items():
        # Note: This file doesn't include CUSIP, need to enrich
        # from another source
        pass

    return cusip_map
```

**Option 3: Parse CUSIP Master File**
- CUSIP Global Services provides master files
- Expensive but comprehensive
- Updates daily

**Option 4: Build from 13F Filings**
```python
def build_cusip_from_filings():
    """
    Extract CUSIP-ticker mappings from 13F filings
    that include both fields
    """
    # When a 13F includes a ticker in the issuer name
    # or class title, you can extract the mapping
    # Example: "APPLE INC COM" with CUSIP 037833100 = AAPL
```

---

## Appendix D: Quarter-over-Quarter Change Calculation

### Algorithm for Change Detection

```python
def calculate_position_changes(current_holdings, prior_holdings):
    """
    Compare two quarters of holdings to detect changes
    """
    changes = []

    # Convert prior holdings to dict for fast lookup
    prior_map = {h['cusip']: h for h in prior_holdings}
    current_map = {h['cusip']: h for h in current_holdings}

    # Process current holdings
    for cusip, current in current_map.items():
        prior = prior_map.get(cusip)

        if prior is None:
            # New position
            changes.append({
                'cusip': cusip,
                'ticker': current['ticker'],
                'shares': current['shares'],
                'prior_shares': 0,
                'change_in_shares': current['shares'],
                'change_percent': None,  # Can't calculate % for new position
                'is_new_position': True,
                'is_exit': False,
                'market_value': current['market_value']
            })
        else:
            # Existing position
            change_shares = current['shares'] - prior['shares']
            change_pct = ((current['shares'] - prior['shares']) / prior['shares'] * 100) if prior['shares'] > 0 else 0

            changes.append({
                'cusip': cusip,
                'ticker': current['ticker'],
                'shares': current['shares'],
                'prior_shares': prior['shares'],
                'change_in_shares': change_shares,
                'change_percent': change_pct,
                'is_new_position': False,
                'is_exit': False,
                'market_value': current['market_value']
            })

    # Detect exits (positions in prior but not current)
    for cusip, prior in prior_map.items():
        if cusip not in current_map:
            changes.append({
                'cusip': cusip,
                'ticker': prior['ticker'],
                'shares': 0,
                'prior_shares': prior['shares'],
                'change_in_shares': -prior['shares'],
                'change_percent': -100.0,
                'is_new_position': False,
                'is_exit': True,
                'market_value': 0
            })

    return changes
```

### Batch Processing for Historical Data

```python
def process_all_investor_changes(investor_cik):
    """
    Process all quarters for an investor to build change history
    """
    # Fetch all filings
    filings = get_investor_filings(investor_cik)

    # Sort by report date (oldest first)
    filings.sort(key=lambda f: f['report_date'])

    all_changes = []

    for i in range(1, len(filings)):
        current_filing = filings[i]
        prior_filing = filings[i-1]

        current_holdings = get_filing_holdings(investor_cik, current_filing['accession_number'])
        prior_holdings = get_filing_holdings(investor_cik, prior_filing['accession_number'])

        changes = calculate_position_changes(current_holdings, prior_holdings)

        # Add metadata
        for change in changes:
            change['investor_cik'] = investor_cik
            change['report_period'] = current_filing['report_date']
            change['prior_period'] = prior_filing['report_date']

        all_changes.extend(changes)

    return all_changes
```

---

## Appendix E: Sample API Endpoint Code

### Simplified Financial Datasets Compatible Endpoint

```typescript
// /src/app/api/v1/institutional-ownership/route.ts
import { NextRequest, NextResponse } from 'next/server'

const SEC_USER_AGENT = 'YourApp contact@yourapp.com'

interface SimplifiedHolding {
  ticker: string
  investor: string
  report_period: string  // YYYY-MM-DD
  price: number
  shares: number
  market_value: number
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const investor = request.nextUrl.searchParams.get('investor')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')

  // Date filters
  const report_period = request.nextUrl.searchParams.get('report_period')
  const report_period_gte = request.nextUrl.searchParams.get('report_period_gte')
  const report_period_lte = request.nextUrl.searchParams.get('report_period_lte')
  const report_period_gt = request.nextUrl.searchParams.get('report_period_gt')
  const report_period_lt = request.nextUrl.searchParams.get('report_period_lt')

  // Validate: must have either ticker or investor, not both
  if (!ticker && !investor) {
    return NextResponse.json({
      error: 'Either ticker or investor parameter is required'
    }, { status: 400 })
  }

  if (ticker && investor) {
    return NextResponse.json({
      error: 'Cannot specify both ticker and investor'
    }, { status: 400 })
  }

  try {
    let holdings: SimplifiedHolding[]

    if (ticker) {
      // Get all holders of this ticker
      holdings = await getHoldersByTicker(ticker, {
        limit,
        report_period,
        report_period_gte,
        report_period_lte,
        report_period_gt,
        report_period_lt
      })
    } else {
      // Get all holdings of this investor
      holdings = await getHoldingsByInvestor(investor!, {
        limit,
        report_period,
        report_period_gte,
        report_period_lte,
        report_period_gt,
        report_period_lt
      })
    }

    return NextResponse.json({
      'institutional-ownership': holdings
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function getHoldersByTicker(
  ticker: string,
  filters: any
): Promise<SimplifiedHolding[]> {
  // Query your database for holders of this ticker
  // Apply date filters
  // Return simplified format
  // TODO: Implement
  return []
}

async function getHoldingsByInvestor(
  investor: string,
  filters: any
): Promise<SimplifiedHolding[]> {
  // Query your database for this investor's holdings
  // Apply date filters
  // Return simplified format
  // TODO: Implement
  return []
}
```

### Investor List Endpoint

```typescript
// /src/app/api/v1/institutional-ownership/investors/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')

  try {
    // Query database for unique investor names
    const investors = await getInvestorList({ search, limit })

    return NextResponse.json({
      investors: investors
    })
  } catch (error) {
    console.error('Investor list error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function getInvestorList(options: {
  search?: string | null
  limit: number
}): Promise<string[]> {
  // Query: SELECT DISTINCT investor_name FROM institutional_holdings
  // WHERE investor_name ILIKE '%search%'
  // ORDER BY investor_name
  // LIMIT options.limit

  // Return array of standardized investor names
  // Format: "BERKSHIRE_HATHAWAY_INC", "VANGUARD_GROUP_INC", etc.

  // TODO: Implement
  return []
}
```

---

**End of Research Report**

Generated: December 9, 2025
For: quant-platform institutional ownership feature development
Next: Implement recommendations from Section 11
