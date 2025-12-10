# Financial Datasets (financialdatasets.ai) - Comprehensive Research Report

## Executive Summary

Financial Datasets is a stock market data API providing real-time and historical financial data for 30,000+ tickers spanning 30+ years. The service offers financial statements, market prices, institutional ownership (13F), insider trades (Form 4), SEC filings, and financial metrics through a RESTful API.

**Key Differentiators:**
- AI-native API design optimized for LLM integration
- MCP (Model Context Protocol) server support
- Free tier for popular tickers (AAPL, MSFT, NVDA, TSLA)
- Simple pricing: Developer ($200/mo), Pro ($2,000/mo), or pay-as-you-go starting at $20

---

## 1. Complete API Documentation

### Authentication
All endpoints require an `X-API-KEY` header for authentication.

Base URL: `https://api.financialdatasets.ai`

### Financial Statements Endpoints

#### Income Statements
**GET** `/financials/income-statements`

**Parameters:**
- `ticker` (required): Stock ticker symbol
- `period` (required): `annual`, `quarterly`, or `ttm`
- `limit` (optional, default: 4): Max statements to return
- `cik` (optional): Central Index Key alternative
- `report_period`, `report_period_gte`, `report_period_lte`, `report_period_gt`, `report_period_lt`: Date filters

**Response Schema:**
```json
{
  "income_statements": [
    {
      "ticker": "string",
      "report_period": "2023-12-25",
      "fiscal_period": "string",
      "period": "quarterly|ttm|annual",
      "currency": "string",
      "revenue": 123,
      "cost_of_revenue": 123,
      "gross_profit": 123,
      "operating_expense": 123,
      "selling_general_and_administrative_expenses": 123,
      "research_and_development": 123,
      "operating_income": 123,
      "interest_expense": 123,
      "ebit": 123,
      "income_tax_expense": 123,
      "net_income_discontinued_operations": 123,
      "net_income_non_controlling_interests": 123,
      "net_income": 123,
      "net_income_common_stock": 123,
      "preferred_dividends_impact": 123,
      "consolidated_income": 123,
      "earnings_per_share": 123,
      "earnings_per_share_diluted": 123,
      "dividends_per_common_share": 123,
      "weighted_average_shares": 123,
      "weighted_average_shares_diluted": 123
    }
  ]
}
```

#### Balance Sheets
**GET** `/financials/balance-sheets`

**Response Schema:**
```json
{
  "balance_sheets": [
    {
      "ticker": "string",
      "report_period": "2023-12-25",
      "fiscal_period": "string",
      "period": "quarterly|ttm|annual",
      "currency": "string",
      "total_assets": 123,
      "current_assets": 123,
      "cash_and_equivalents": 123,
      "inventory": 123,
      "current_investments": 123,
      "trade_and_non_trade_receivables": 123,
      "non_current_assets": 123,
      "property_plant_and_equipment": 123,
      "goodwill_and_intangible_assets": 123,
      "investments": 123,
      "non_current_investments": 123,
      "outstanding_shares": 123,
      "tax_assets": 123,
      "total_liabilities": 123,
      "current_liabilities": 123,
      "current_debt": 123,
      "trade_and_non_trade_payables": 123,
      "deferred_revenue": 123,
      "deposit_liabilities": 123,
      "non_current_liabilities": 123,
      "non_current_debt": 123,
      "tax_liabilities": 123,
      "shareholders_equity": 123,
      "retained_earnings": 123,
      "accumulated_other_comprehensive_income": 123,
      "total_debt": 123
    }
  ]
}
```

#### Cash Flow Statements
**GET** `/financials/cash-flow-statements`

**Response Schema:**
```json
{
  "cash_flow_statements": [
    {
      "ticker": "string",
      "report_period": "2023-12-25",
      "fiscal_period": "string",
      "period": "quarterly|ttm|annual",
      "currency": "string",
      "net_income": 123,
      "depreciation_and_amortization": 123,
      "share_based_compensation": 123,
      "net_cash_flow_from_operations": 123,
      "capital_expenditure": 123,
      "business_acquisitions_and_disposals": 123,
      "investment_acquisitions_and_disposals": 123,
      "net_cash_flow_from_investing": 123,
      "issuance_or_repayment_of_debt_securities": 123,
      "issuance_or_purchase_of_equity_shares": 123,
      "dividends_and_other_cash_distributions": 123,
      "net_cash_flow_from_financing": 123,
      "change_in_cash_and_equivalents": 123,
      "effect_of_exchange_rate_changes": 123,
      "ending_cash_balance": 123,
      "free_cash_flow": 123
    }
  ]
}
```

#### All Financials
**GET** `/financials` - Returns income statements, balance sheets, and cash flow statements in one call.

### Market Data Endpoints

#### Stock Prices (Historical)
**GET** `/prices`

**Parameters:**
- `ticker` (required)
- `limit` (optional, default: 5000, max: 5000)

#### Stock Prices (Snapshot)
**GET** `/prices/snapshot` - Latest price data

#### Crypto Prices
**GET** `/crypto/prices` - Historical cryptocurrency prices
**GET** `/crypto/prices/snapshot` - Latest crypto prices

### Ownership & Insider Activity

#### Institutional Ownership (13F Data)
**GET** `/institutional-ownership`

**Parameters:**
- `ticker` OR `investor` (one required, not both)
- `limit` (optional, default: 10)
- `report_period`, `report_period_gte`, `report_period_lte`, `report_period_gt`, `report_period_lt`

**Response Schema:**
```json
{
  "institutional-ownership": [
    {
      "ticker": "string",
      "investor": "string",
      "report_period": "2023-12-25",
      "price": 123,
      "shares": 123,
      "market_value": 123
    }
  ]
}
```

**Key Notes:**
- Data sourced from Form 13F quarterly filings
- 45-day lag from quarter end
- Only includes long positions in SEC-registered securities
- Covers investment managers with $100M+ in assets

**Available Resources:**
- List of tickers: `GET /institutional-ownership/tickers/`
- List of investors: `GET /institutional-ownership/investors/`

#### Insider Trades (Form 4 Data)
**GET** `/insider-trades`

**Parameters:**
- `ticker` (required)
- `limit` (optional, default: 10, max: 1000)
- `filing_date`, `filing_date_gte`, `filing_date_lte`, `filing_date_gt`, `filing_date_lt`

**Response Schema:**
```json
{
  "insider_trades": [
    {
      "ticker": "string",
      "issuer": "string",
      "name": "string",
      "title": "string",
      "is_board_director": true,
      "transaction_date": "2023-12-25",
      "transaction_shares": 123,
      "transaction_price_per_share": 123,
      "transaction_value": 123,
      "shares_owned_before_transaction": 123,
      "shares_owned_after_transaction": 123,
      "security_title": "string",
      "filing_date": "2023-12-25"
    }
  ]
}
```

### SEC Filings

#### SEC Filings List
**GET** `/filings`

**Parameters:**
- `ticker` OR `cik` (one required)
- `filing_type` (optional): `10-K`, `10-Q`, `8-K`, `4`, `144`

**Response Schema:**
```json
{
  "filings": [
    {
      "cik": 123,
      "accession_number": "string",
      "filing_type": "string",
      "report_date": "2023-12-25",
      "ticker": "string",
      "url": "string"
    }
  ]
}
```

#### Filing Items
**GET** `/filings/items` - Extract specific sections from filings

### Financial Analysis Endpoints

#### Financial Metrics (43 metrics across 6 categories)
**GET** `/financial-metrics`
**GET** `/financial-metrics/snapshot`

**Available Metrics:**

**Valuation Metrics:**
- Market Cap
- Enterprise Value
- Price-to-Earnings Ratio
- Price-to-Book Ratio
- Price-to-Sales Ratio
- Enterprise Value-to-EBITDA Ratio
- Enterprise Value-to-Revenue Ratio
- Free Cash Flow Yield
- PEG Ratio

**Profitability Metrics:**
- Gross Margin
- Operating Margin
- Net Margin
- Return on Equity
- Return on Assets
- Return on Invested Capital

**Efficiency Metrics:**
- Asset Turnover
- Inventory Turnover
- Receivables Turnover
- Days Sales Outstanding
- Operating Cycle
- Working Capital Turnover

**Liquidity Metrics:**
- Current Ratio
- Quick Ratio
- Cash Ratio
- Operating Cash Flow Ratio

**Leverage Metrics:**
- Debt-to-Equity
- Debt-to-Assets
- Interest Coverage

**Growth & Per-Share Metrics:**
- Revenue Growth
- Earnings Growth
- Book Value Growth
- Earnings Per Share Growth
- Free Cash Flow Growth
- Operating Income Growth
- EBITDA Growth
- Payout Ratio
- Earnings Per Share
- Book Value Per Share
- Free Cash Flow Per Share

#### Analyst Estimates
**GET** `/analyst-estimates`

**Response Schema:**
```json
{
  "analyst_estimates": [
    {
      "fiscal_period": "2023-12-25",
      "period": "annual",
      "earnings_per_share": 123
    }
  ]
}
```

**Notes:**
- Generated from internal models
- Mean estimates track consensus closely (< 1% deviation)

#### Segmented Revenues
**GET** `/financials/segmented-revenues` - Business segment and geographic revenue breakdowns

### Company Information

#### Company Facts
**GET** `/company/facts` - Company metadata and facts (by CIK or ticker)

### Market Intelligence

#### Company News
**GET** `/news`

**Parameters:**
- `ticker` (required)
- `start_date`, `end_date` (optional, YYYY-MM-DD format)
- `limit` (optional, default: 100, max: 100)

**Response Schema:**
```json
{
  "news": [
    {
      "ticker": "string",
      "title": "string",
      "author": "string",
      "source": "string",
      "date": "2023-12-25",
      "url": "string",
      "sentiment": "string"
    }
  ]
}
```

**Data Sources:**
- Reuters
- Investing.com
- The Motley Fool
- Sourced from RSS feeds

#### Interest Rates
**GET** `/macro/interest-rates` - Historical interest rate data
**GET** `/macro/interest-rates/snapshot` - Latest rates

### Search & Screening

#### Stock Screener
**POST** `/financials/search/screener` - Filter stocks by financial criteria

#### Financial Line Item Search
**POST** `/financials/search/line-items` - Search specific financial statement line items

---

## 2. Data Sources Analysis

### Primary Data Source: SEC EDGAR

Financial Datasets primarily aggregates data from the SEC's EDGAR (Electronic Data Gathering, Analysis, and Retrieval) system.

#### SEC EDGAR Overview

**Official SEC APIs:**
- Base URL: `https://data.sec.gov/api/`
- No authentication required
- Rate limit: 10 requests/second
- Real-time updates (< 1 minute processing delay for XBRL)

**Key SEC API Endpoints:**

1. **Company Facts API**
   - URL: `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json`
   - Returns all XBRL disclosures from a single company
   - Includes all financial statement data points

2. **Frames API**
   - URL: `https://data.sec.gov/api/xbrl/frames/us-gaap/{concept}/{unit}/{period}.json`
   - Aggregates one fact across all companies for a period
   - Example: `us-gaap/AccountsPayableCurrent/USD/CY2019Q1I`

3. **Submissions API**
   - URL: `https://data.sec.gov/submissions/CIK##########.json`
   - Filing history for each entity

4. **Bulk Downloads** (Most efficient for large-scale ingestion)
   - **companyfacts.zip**: All company XBRL data (updated nightly ~3AM ET)
     - URL: `https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip`
   - **submissions.zip**: All filing history
     - URL: `https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip`

#### SEC Filing Types Used

**Financial Statements:**
- **10-K**: Annual reports with audited financial statements
- **10-Q**: Quarterly reports with unaudited financials
- **8-K**: Current reports for material events
- **20-F, 40-F, 6-K**: Foreign issuer variants

**Ownership & Insider Data:**
- **Form 13F**: Institutional investment manager quarterly holdings
  - Required for managers with $100M+ in assets
  - Filed within 45 days of quarter end
  - XML format (standardized after 2013Q2)
  - Includes CUSIP, shares held, market value, voting authority

- **Form 3**: Initial insider ownership statement
- **Form 4**: Changes in insider ownership (must file within 2 business days)
- **Form 5**: Annual insider ownership statement

#### XBRL (eXtensible Business Reporting Language)

**What is XBRL:**
- XML-based format for financial reporting
- Required by SEC since 2009
- Standardized taxonomies (US-GAAP, IFRS)
- Companies can extend with custom taxonomies
- Inline XBRL (iXBRL) embedded in HTML reports

**XBRL Structure:**
- **Facts**: Individual data points (e.g., revenue = $1,000,000)
- **Contexts**: Time periods and dimensions
- **Units**: Measurement units (USD, shares, etc.)
- **Taxonomies**: Standard definitions (us-gaap:Revenue)
- **Dimensions**: Segmentation (by geography, product line, etc.)

### Secondary Data Sources

**Market Prices:**
- Likely from market data providers (not publicly disclosed by Financial Datasets)
- Real-time and historical price feeds

**News Data:**
- RSS feeds from publishers:
  - Reuters
  - Investing.com
  - The Motley Fool
  - Additional publishers added by request

**Analyst Estimates:**
- Generated from internal models
- Track consensus estimates closely (< 1% deviation)

### How to Access SEC Data Directly

#### Method 1: SEC Official APIs (Free, No Authentication)

```python
import requests

# Get company facts (all XBRL data for a company)
cik = "0000320193"  # Apple Inc. (with leading zeros, 10 digits)
url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
headers = {"User-Agent": "YourName yourname@email.com"}  # Required by SEC
response = requests.get(url, headers=headers)
data = response.json()

# Get specific concept across all companies
url = "https://data.sec.gov/api/xbrl/frames/us-gaap/Revenue/USD/CY2023Q4.json"
response = requests.get(url, headers=headers)
```

#### Method 2: Bulk Downloads (Most Efficient)

```python
import requests
import zipfile
import json
from io import BytesIO

# Download companyfacts.zip (updated nightly)
url = "https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip"
headers = {"User-Agent": "YourName yourname@email.com"}

response = requests.get(url, headers=headers)
zip_file = zipfile.ZipFile(BytesIO(response.content))

# Extract specific company data
cik = "0000320193"
company_data = json.loads(zip_file.read(f"CIK{cik}.json"))
```

#### Method 3: Direct EDGAR Index Files

```python
# Daily index files list all filings
# Format: https://www.sec.gov/Archives/edgar/daily-index/YYYY/QTRn/master.YYYYMMDD.idx

url = "https://www.sec.gov/Archives/edgar/daily-index/2024/QTR4/master.20241231.idx"
response = requests.get(url, headers=headers)

# Parse pipe-delimited format
# CIK|Company Name|Form Type|Date Filed|Filename
```

---

## 3. GitHub Repositories & Open Source Tools

### Founder's Repositories (virattt)

#### 1. **dexter** (TypeScript)
- **Stars:** 3,954
- **Description:** Autonomous agent for deep financial research
- **Tech Stack:**
  - Runtime: Bun (v1.0+)
  - UI: React + Ink (terminal UI)
  - LLM: LangChain.js (OpenAI, Anthropic, Google)
  - Schema: Zod
- **Architecture:**
  - Planning Agent: Creates structured task lists
  - Action Agent: Executes research steps
  - Validation Agent: Verifies completion
  - Answer Agent: Synthesizes findings
- **Data Source:** Uses Financial Datasets API (not direct SEC parsing)
- **Key Features:**
  - Task decomposition
  - Autonomous execution
  - Self-validation
  - Real-time financial statements access
  - Smart caching (30-second fresh filing cache)

#### 2. **ai-hedge-fund** (Python)
- **Stars:** 42,580
- **Description:** AI Hedge Fund Team (educational project)
- **Architecture:** 18 specialized agents
  - 12 Investment Philosophy Agents (Buffett, Munger, Cathie Wood, etc.)
  - 4 Analysis Agents (Valuation, Sentiment, Fundamentals, Technicals)
  - 2 Support Agents (Risk Manager, Portfolio Manager)
- **Data Sources:**
  - Financial Datasets API (primary)
  - Free tier covers: AAPL, GOOGL, MSFT, NVDA, TSLA
- **Tech Stack:**
  - Backend: Python (58.1%), Poetry dependency management
  - Frontend: TypeScript (37.7%), React
  - LLMs: OpenAI (GPT-4o), Groq, Anthropic, DeepSeek, Ollama
- **Features:**
  - CLI with backtesting
  - Web UI for visualization
  - Multi-agent collaboration
  - No actual trade execution (educational only)

#### 3. **financial-datasets** (Python)
- **Stars:** 385
- **Description:** Generate Q&A datasets from financial documents using LLMs
- **Purpose:** Create training data for financial AI models
- **Data Sources:**
  - Free-form text
  - PDF documents (via URL)
  - SEC filings (10-K, 10-Q by ticker and year)
  - Selective section filtering
- **Output:** Question-answer pairs with contextual passages
- **Installation:**
  ```bash
  pip install financial-datasets
  ```
- **Example:**
  ```python
  from financial_datasets.generator import DatasetGenerator

  generator = DatasetGenerator(model="gpt-4-turbo", api_key="your-key")
  dataset = generator.generate_from_pdf(
      url="https://www.berkshirehathaway.com/letters/2023ltr.pdf",
      max_questions=100
  )
  ```

#### 4. **edgartools** (Fork)
- **Description:** Python library for working with SEC Edgar
- **Original:** dgunning/edgartools
- **Stars (original):** Popular SEC parsing library

#### 5. Other Related Projects
- **ai-financial-agent** (TypeScript, 1,550 stars)
- **financial-agent-ui** (TypeScript, 770 stars)
- **openbb-financialdatasets-backend** (Python, 30 stars) - Connects Financial Datasets to OpenBB
- **financial-agent** (Python, 235 stars) - Built with LangChain

### Essential Open Source Tools for Building Your Own

#### SEC Data Extraction

**1. edgartools** (dgunning/edgartools)
- **Description:** "The world's easiest, most powerful edgar library"
- **Language:** Python
- **Performance:** 10-30x faster than alternatives (lxml + PyArrow optimized)
- **Features:**
  - Any form type (10-K, 10-Q, 8-K, S-1, etc.)
  - Complete history since 1994
  - Full XBRL standardization
  - Individual line items via XBRL tags
  - Automatic unit conversion
  - Complete dimensional data (segments, geographies)
  - Smart caching (30-second fresh filing cache)
  - Configurable rate limiting
  - Returns pandas DataFrames
  - Clean text extraction from HTML
  - 1000+ tests, type hints
- **Installation:**
  ```bash
  pip install edgartools
  ```
- **Usage:**
  ```python
  from edgar import *
  set_identity("your.name@example.com")  # Required by SEC

  # Get company
  company = Company("AAPL")

  # Get financials
  financials = company.get_financials()
  balance_sheet = financials.balance_sheet()
  income_statement = financials.income_statement()
  cash_flow = financials.cash_flow_statement()

  # Get specific filing
  filing = company.get_filings(form="10-K").latest()
  xbrl = filing.xbrl()

  # Multi-period analysis
  balance_sheets = xbrl.balance_sheet
  ```
- **AI Integration:** Claude MCP server support

**2. py-xbrl** (manusimidt/py-xbrl)
- **Description:** Python-based parser for XBRL and iXBRL files
- **License:** GNU GPLv3
- **Python Support:** 3.9-3.14
- **Features:**
  - Parse Instance Documents from SEC
  - Follows XBRL 2.1 Specification (2003)
  - iXBRL 1.1 Specification (2013) support
  - Extract facts with contexts
  - Handle custom taxonomies
- **Installation:**
  ```bash
  pip install py-xbrl
  ```

**3. tidyxbrl**
- **Description:** Simplest method to parse XBRL data in Python
- **Features:**
  - Parse XBRL data files
  - Dynamic data structures
  - SEC EDGAR interface integration
  - XBRL API interface
- **Installation:**
  ```bash
  pip install tidyxbrl
  ```

**4. sec-api (janlukasschroeder/sec-api-python)** - Commercial API
- **Description:** Python SEC EDGAR Filings API
- **Coverage:** 18+ million filings, all 150 form types
- **Features:**
  - Full-text search (all filings since 2001)
  - Real-time stream API
  - XBRL-to-JSON converter
  - Standardized financial statements
  - Query API for filtering
- **Installation:**
  ```bash
  pip install sec-api
  ```
- **Pricing:** Commercial (paid API)

**5. sec-edgar-financials** (farhadab)
- **Description:** Extract financial data from SEC EDGAR
- **Format:** Parses SGML to JSON
- **Form Types:** 8-K, 10-Q, 10-K, etc.

**6. edgar-crawler** (lefterisloukas)
- **Description:** Download SEC reports and extract sections to JSON
- **Features:**
  - Download raw filings
  - Parse specific Item sections
  - Structured JSON output
- **Presented:** WWW 2025 Conference

**7. sec-parser** (alphanome-ai)
- **Description:** Parse SEC EDGAR HTML into semantic tree structure
- **Features:**
  - Section titles, paragraphs, tables
  - Visual/semantic structure preservation
  - Hierarchical tree representation

#### 13F (Institutional Ownership) Parsing

**EDGAR-Parsing** (elsaifym)
- **Description:** Download, extract, and parse 13F filings
- **Language:** R
- **Stars:** 25
- **Pipeline:**
  1. **get_data.R**: Retrieve pricing from CRSP (WRDS subscription)
  2. **get_cusip_universe.R**: Process eligible 13(f) securities list
  3. **1_get_master_files.R**: Download SEC filing index by quarter
  4. **2_create_13f_universe.R**: Generate per-CIK manifest files
  5. **3_process_all_ciks.R** or **3_process_one_cik.R**: Process filings
  6. **4_combine_tables.R**: Merge into final datasets
- **Output:**
  - Biographical manager records
  - Consolidated holdings (excludes options, callable bonds)
- **Execution Options:**
  - SLURM batch processing
  - Single-session parallelization
- **Incremental Update Flags:**
  - `overwrite_download`: Re-fetch filings
  - `overwrite_extract`: Re-extract biographical data
  - `overwrite_parse`: Re-parse tables

**Other 13F Tools:**
- **codeLovingYogi/Edgar_Scraper** (Python): XML and ASCII text parsing
- **CodeWritingCow/sec-web-scraper-13f** (Python): Parse 13F to TSV
- **cpackard/fundholdings** (Python): Web crawler for fund holdings
- **ryansmccoy/py-sec-edgar** (Python): 224,996 13F-HR records

#### Form 4 (Insider Trading) Parsing

**Key Considerations:**
- Form 4 format: Hybrid HTML/XML (HTML header, XML body)
- Must file within 2 business days of transaction
- XML format after 2006 (standardized)

**Parsing Approach:**
1. Build Document Object Model (DOM) tree
2. Recursively iterate nodes
3. Store values in structured format

**Available APIs:**
- **sec-api.io**: Insider Ownership Trading API (commercial)
  - Forms 3, 4, 5 in JSON format
  - Real-time updates
  - Indexed and searchable

**SEC Data Sets:**
- Insider Transactions XML data sets (January 2006 - present)
- URL pattern: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=4`

---

## 4. Building Your Own Version - Implementation Guide

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (FastAPI/Flask)              │
│  - Authentication (API keys)                                │
│  - Rate limiting                                            │
│  - Request validation                                       │
│  - Response formatting                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                    │
│  - Financial calculations                                   │
│  - Data aggregation                                         │
│  - Metric computation                                       │
│  - Caching (Redis)                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer (PostgreSQL)            │
│  - Financial statements                                     │
│  - Market prices                                            │
│  - Ownership data                                           │
│  - Insider trades                                           │
│  - Company metadata                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion Pipeline                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ SEC EDGAR   │  │ Market Data │  │ News Feeds  │       │
│  │ Parser      │  │ Ingestion   │  │ (RSS)       │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│         │                │                 │                │
│         ▼                ▼                 ▼                │
│  ┌──────────────────────────────────────────────┐         │
│  │  Task Queue (Celery/RQ) + Scheduler          │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Tech Stack

**Backend:**
- **Language:** Python 3.10+
- **Web Framework:** FastAPI (modern, async, auto-documentation)
- **Database:** PostgreSQL 14+ with TimescaleDB extension (for time-series data)
- **Caching:** Redis (for API rate limiting and response caching)
- **Task Queue:** Celery with Redis broker (for async ingestion jobs)
- **Scheduler:** Celery Beat or APScheduler (for daily updates)

**Data Processing:**
- **XBRL Parsing:** edgartools or py-xbrl
- **Data Manipulation:** pandas, numpy
- **HTTP Requests:** httpx (async support)

**Infrastructure:**
- **Container:** Docker + docker-compose
- **Reverse Proxy:** Nginx
- **Monitoring:** Prometheus + Grafana
- **Logging:** Python logging + ELK stack (optional)

### Database Schema Design

#### Core Tables

```sql
-- Companies
CREATE TABLE companies (
    cik VARCHAR(10) PRIMARY KEY,  -- Central Index Key (10 digits with leading zeros)
    ticker VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    sic_code VARCHAR(4),  -- Standard Industrial Classification
    irs_number VARCHAR(10),
    state_of_incorporation VARCHAR(2),
    fiscal_year_end VARCHAR(4),  -- MMDD format
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_ticker ON companies(ticker);
CREATE INDEX idx_companies_sic ON companies(sic_code);

-- Tickers (many-to-one: a company can have multiple tickers over time)
CREATE TABLE tickers (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10) NOT NULL,
    exchange VARCHAR(10),  -- NASDAQ, NYSE, etc.
    is_primary BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickers_ticker ON tickers(ticker);
CREATE INDEX idx_tickers_cik ON tickers(cik);

-- SEC Filings
CREATE TABLE sec_filings (
    accession_number VARCHAR(20) PRIMARY KEY,  -- Unique filing identifier
    cik VARCHAR(10) REFERENCES companies(cik),
    filing_type VARCHAR(10) NOT NULL,  -- 10-K, 10-Q, 8-K, 13F, 4, etc.
    filing_date DATE NOT NULL,
    report_date DATE,  -- The period the filing covers
    fiscal_year INTEGER,
    fiscal_period VARCHAR(2),  -- Q1, Q2, Q3, Q4, FY
    document_url TEXT,  -- Direct link to filing
    htm_url TEXT,  -- Human-readable HTML version
    xml_url TEXT,  -- XBRL XML if available
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_filings_cik ON sec_filings(cik);
CREATE INDEX idx_filings_type ON sec_filings(filing_type);
CREATE INDEX idx_filings_date ON sec_filings(filing_date);
CREATE INDEX idx_filings_report_date ON sec_filings(report_date);
CREATE INDEX idx_filings_processed ON sec_filings(processed) WHERE NOT processed;

-- Income Statements
CREATE TABLE income_statements (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    accession_number VARCHAR(20) REFERENCES sec_filings(accession_number),
    report_period DATE NOT NULL,
    fiscal_period VARCHAR(2),  -- Q1, Q2, Q3, Q4, FY
    period_type VARCHAR(10) NOT NULL,  -- annual, quarterly, ttm
    currency VARCHAR(3) DEFAULT 'USD',

    -- Revenue & Cost
    revenue NUMERIC(20, 2),
    cost_of_revenue NUMERIC(20, 2),
    gross_profit NUMERIC(20, 2),

    -- Operating Expenses
    operating_expense NUMERIC(20, 2),
    selling_general_and_administrative_expenses NUMERIC(20, 2),
    research_and_development NUMERIC(20, 2),

    -- Operating Income
    operating_income NUMERIC(20, 2),

    -- Other Income/Expenses
    interest_expense NUMERIC(20, 2),
    interest_income NUMERIC(20, 2),
    other_income_expense NUMERIC(20, 2),

    -- Pre-tax & Tax
    ebit NUMERIC(20, 2),
    ebt NUMERIC(20, 2),  -- Earnings Before Tax
    income_tax_expense NUMERIC(20, 2),

    -- Net Income
    net_income_discontinued_operations NUMERIC(20, 2),
    net_income_non_controlling_interests NUMERIC(20, 2),
    net_income NUMERIC(20, 2),
    net_income_common_stock NUMERIC(20, 2),
    preferred_dividends_impact NUMERIC(20, 2),
    consolidated_income NUMERIC(20, 2),

    -- Per Share Data
    earnings_per_share NUMERIC(20, 4),
    earnings_per_share_diluted NUMERIC(20, 4),
    dividends_per_common_share NUMERIC(20, 4),
    weighted_average_shares NUMERIC(20, 2),
    weighted_average_shares_diluted NUMERIC(20, 2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(cik, report_period, period_type)
);

CREATE INDEX idx_income_ticker ON income_statements(ticker);
CREATE INDEX idx_income_cik ON income_statements(cik);
CREATE INDEX idx_income_period ON income_statements(report_period);
CREATE INDEX idx_income_type ON income_statements(period_type);

-- Balance Sheets
CREATE TABLE balance_sheets (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    accession_number VARCHAR(20) REFERENCES sec_filings(accession_number),
    report_period DATE NOT NULL,
    fiscal_period VARCHAR(2),
    period_type VARCHAR(10) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Assets
    total_assets NUMERIC(20, 2),
    current_assets NUMERIC(20, 2),
    cash_and_equivalents NUMERIC(20, 2),
    cash_and_cash_equivalents_restricted NUMERIC(20, 2),
    marketable_securities NUMERIC(20, 2),
    inventory NUMERIC(20, 2),
    current_investments NUMERIC(20, 2),
    trade_and_non_trade_receivables NUMERIC(20, 2),
    accounts_receivable NUMERIC(20, 2),
    prepaid_expenses NUMERIC(20, 2),
    other_current_assets NUMERIC(20, 2),

    non_current_assets NUMERIC(20, 2),
    property_plant_and_equipment NUMERIC(20, 2),
    accumulated_depreciation NUMERIC(20, 2),
    goodwill NUMERIC(20, 2),
    intangible_assets NUMERIC(20, 2),
    goodwill_and_intangible_assets NUMERIC(20, 2),
    investments NUMERIC(20, 2),
    non_current_investments NUMERIC(20, 2),
    tax_assets NUMERIC(20, 2),
    deferred_tax_assets NUMERIC(20, 2),
    other_non_current_assets NUMERIC(20, 2),

    -- Liabilities
    total_liabilities NUMERIC(20, 2),
    current_liabilities NUMERIC(20, 2),
    current_debt NUMERIC(20, 2),
    short_term_debt NUMERIC(20, 2),
    trade_and_non_trade_payables NUMERIC(20, 2),
    accounts_payable NUMERIC(20, 2),
    deferred_revenue NUMERIC(20, 2),
    current_deferred_revenue NUMERIC(20, 2),
    accrued_expenses NUMERIC(20, 2),
    deposit_liabilities NUMERIC(20, 2),
    other_current_liabilities NUMERIC(20, 2),

    non_current_liabilities NUMERIC(20, 2),
    non_current_debt NUMERIC(20, 2),
    long_term_debt NUMERIC(20, 2),
    non_current_deferred_revenue NUMERIC(20, 2),
    tax_liabilities NUMERIC(20, 2),
    deferred_tax_liabilities NUMERIC(20, 2),
    other_non_current_liabilities NUMERIC(20, 2),

    total_debt NUMERIC(20, 2),

    -- Equity
    shareholders_equity NUMERIC(20, 2),
    common_stock NUMERIC(20, 2),
    preferred_stock NUMERIC(20, 2),
    retained_earnings NUMERIC(20, 2),
    treasury_stock NUMERIC(20, 2),
    accumulated_other_comprehensive_income NUMERIC(20, 2),
    additional_paid_in_capital NUMERIC(20, 2),
    non_controlling_interests NUMERIC(20, 2),

    outstanding_shares NUMERIC(20, 2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(cik, report_period, period_type)
);

CREATE INDEX idx_balance_ticker ON balance_sheets(ticker);
CREATE INDEX idx_balance_cik ON balance_sheets(cik);
CREATE INDEX idx_balance_period ON balance_sheets(report_period);

-- Cash Flow Statements
CREATE TABLE cash_flow_statements (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    accession_number VARCHAR(20) REFERENCES sec_filings(accession_number),
    report_period DATE NOT NULL,
    fiscal_period VARCHAR(2),
    period_type VARCHAR(10) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Operating Activities
    net_income NUMERIC(20, 2),
    depreciation_and_amortization NUMERIC(20, 2),
    share_based_compensation NUMERIC(20, 2),
    deferred_income_taxes NUMERIC(20, 2),
    changes_in_working_capital NUMERIC(20, 2),
    changes_in_accounts_receivable NUMERIC(20, 2),
    changes_in_inventory NUMERIC(20, 2),
    changes_in_accounts_payable NUMERIC(20, 2),
    changes_in_deferred_revenue NUMERIC(20, 2),
    other_operating_activities NUMERIC(20, 2),
    net_cash_flow_from_operations NUMERIC(20, 2),

    -- Investing Activities
    capital_expenditure NUMERIC(20, 2),
    business_acquisitions_and_disposals NUMERIC(20, 2),
    investment_acquisitions_and_disposals NUMERIC(20, 2),
    purchases_of_investments NUMERIC(20, 2),
    sales_of_investments NUMERIC(20, 2),
    purchases_of_property_plant_equipment NUMERIC(20, 2),
    other_investing_activities NUMERIC(20, 2),
    net_cash_flow_from_investing NUMERIC(20, 2),

    -- Financing Activities
    issuance_or_repayment_of_debt_securities NUMERIC(20, 2),
    issuance_of_debt NUMERIC(20, 2),
    repayment_of_debt NUMERIC(20, 2),
    issuance_or_purchase_of_equity_shares NUMERIC(20, 2),
    issuance_of_common_stock NUMERIC(20, 2),
    repurchase_of_common_stock NUMERIC(20, 2),
    dividends_and_other_cash_distributions NUMERIC(20, 2),
    dividends_paid NUMERIC(20, 2),
    other_financing_activities NUMERIC(20, 2),
    net_cash_flow_from_financing NUMERIC(20, 2),

    -- Net Change
    change_in_cash_and_equivalents NUMERIC(20, 2),
    effect_of_exchange_rate_changes NUMERIC(20, 2),
    beginning_cash_balance NUMERIC(20, 2),
    ending_cash_balance NUMERIC(20, 2),

    -- Derived Metrics
    free_cash_flow NUMERIC(20, 2),  -- Operating CF - CapEx

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(cik, report_period, period_type)
);

CREATE INDEX idx_cashflow_ticker ON cash_flow_statements(ticker);
CREATE INDEX idx_cashflow_cik ON cash_flow_statements(cik);
CREATE INDEX idx_cashflow_period ON cash_flow_statements(report_period);

-- Stock Prices (TimescaleDB hypertable for time-series optimization)
CREATE TABLE stock_prices (
    ticker VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    open NUMERIC(20, 4),
    high NUMERIC(20, 4),
    low NUMERIC(20, 4),
    close NUMERIC(20, 4),
    adjusted_close NUMERIC(20, 4),
    volume BIGINT,
    split_coefficient NUMERIC(10, 4) DEFAULT 1.0,
    dividend NUMERIC(20, 4) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (ticker, date)
);

-- Convert to TimescaleDB hypertable (if using TimescaleDB)
-- SELECT create_hypertable('stock_prices', 'date');

CREATE INDEX idx_prices_ticker ON stock_prices(ticker);
CREATE INDEX idx_prices_date ON stock_prices(date);

-- Institutional Ownership (13F Data)
CREATE TABLE institutional_investors (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),  -- Standardized for querying
    address TEXT,
    city VARCHAR(100),
    state_country VARCHAR(100),
    zip_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_investors_name ON institutional_investors(normalized_name);

CREATE TABLE institutional_holdings (
    id SERIAL PRIMARY KEY,
    investor_cik VARCHAR(10) REFERENCES institutional_investors(cik),
    ticker VARCHAR(10),
    cusip VARCHAR(9) NOT NULL,  -- Committee on Uniform Securities Identification Procedures
    report_period DATE NOT NULL,  -- Quarter end date
    filing_date DATE NOT NULL,
    shares BIGINT NOT NULL,
    market_value NUMERIC(20, 2) NOT NULL,  -- In thousands or specify unit
    price NUMERIC(20, 4),  -- Estimated price per share

    -- Investment discretion
    investment_discretion VARCHAR(10),  -- SOLE, SHARED, NONE

    -- Voting authority
    voting_authority_sole BIGINT,
    voting_authority_shared BIGINT,
    voting_authority_none BIGINT,

    -- Change from previous quarter (compute separately)
    shares_change BIGINT,
    shares_change_percent NUMERIC(10, 4),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(investor_cik, cusip, report_period)
);

CREATE INDEX idx_holdings_investor ON institutional_holdings(investor_cik);
CREATE INDEX idx_holdings_ticker ON institutional_holdings(ticker);
CREATE INDEX idx_holdings_cusip ON institutional_holdings(cusip);
CREATE INDEX idx_holdings_period ON institutional_holdings(report_period);
CREATE INDEX idx_holdings_filing_date ON institutional_holdings(filing_date);

-- Insider Trades (Form 4 Data)
CREATE TABLE insiders (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_insiders_cik ON insiders(cik);
CREATE INDEX idx_insiders_name ON insiders(normalized_name);

CREATE TABLE insider_trades (
    id SERIAL PRIMARY KEY,
    insider_id INTEGER REFERENCES insiders(id),
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    issuer VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    is_board_director BOOLEAN DEFAULT false,
    is_officer BOOLEAN DEFAULT false,
    is_ten_percent_owner BOOLEAN DEFAULT false,

    -- Transaction details
    transaction_date DATE NOT NULL,
    transaction_code VARCHAR(2),  -- P=Purchase, S=Sale, A=Award, etc.
    transaction_shares NUMERIC(20, 2),
    transaction_price_per_share NUMERIC(20, 4),
    transaction_value NUMERIC(20, 2),

    -- Ownership after transaction
    shares_owned_before_transaction NUMERIC(20, 2),
    shares_owned_after_transaction NUMERIC(20, 2),

    -- Security details
    security_title VARCHAR(255),
    security_acquired_disposed VARCHAR(1),  -- A=Acquired, D=Disposed

    -- Filing details
    filing_date DATE NOT NULL,
    accession_number VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(accession_number, transaction_date, name)
);

CREATE INDEX idx_insider_trades_cik ON insider_trades(cik);
CREATE INDEX idx_insider_trades_ticker ON insider_trades(ticker);
CREATE INDEX idx_insider_trades_insider ON insider_trades(insider_id);
CREATE INDEX idx_insider_trades_transaction_date ON insider_trades(transaction_date);
CREATE INDEX idx_insider_trades_filing_date ON insider_trades(filing_date);

-- Financial Metrics (Computed/Cached)
CREATE TABLE financial_metrics (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    report_period DATE NOT NULL,
    period_type VARCHAR(10) NOT NULL,

    -- Valuation Metrics
    market_cap NUMERIC(20, 2),
    enterprise_value NUMERIC(20, 2),
    pe_ratio NUMERIC(10, 4),
    price_to_book NUMERIC(10, 4),
    price_to_sales NUMERIC(10, 4),
    ev_to_ebitda NUMERIC(10, 4),
    ev_to_revenue NUMERIC(10, 4),
    free_cash_flow_yield NUMERIC(10, 4),
    peg_ratio NUMERIC(10, 4),

    -- Profitability Metrics
    gross_margin NUMERIC(10, 4),
    operating_margin NUMERIC(10, 4),
    net_margin NUMERIC(10, 4),
    return_on_equity NUMERIC(10, 4),
    return_on_assets NUMERIC(10, 4),
    return_on_invested_capital NUMERIC(10, 4),
    ebitda NUMERIC(20, 2),
    ebitda_margin NUMERIC(10, 4),

    -- Efficiency Metrics
    asset_turnover NUMERIC(10, 4),
    inventory_turnover NUMERIC(10, 4),
    receivables_turnover NUMERIC(10, 4),
    days_sales_outstanding NUMERIC(10, 2),
    operating_cycle NUMERIC(10, 2),
    working_capital_turnover NUMERIC(10, 4),

    -- Liquidity Metrics
    current_ratio NUMERIC(10, 4),
    quick_ratio NUMERIC(10, 4),
    cash_ratio NUMERIC(10, 4),
    operating_cash_flow_ratio NUMERIC(10, 4),
    working_capital NUMERIC(20, 2),

    -- Leverage Metrics
    debt_to_equity NUMERIC(10, 4),
    debt_to_assets NUMERIC(10, 4),
    interest_coverage NUMERIC(10, 4),
    debt_to_ebitda NUMERIC(10, 4),

    -- Growth Metrics
    revenue_growth NUMERIC(10, 4),
    earnings_growth NUMERIC(10, 4),
    book_value_growth NUMERIC(10, 4),
    eps_growth NUMERIC(10, 4),
    free_cash_flow_growth NUMERIC(10, 4),
    operating_income_growth NUMERIC(10, 4),
    ebitda_growth NUMERIC(10, 4),

    -- Per-Share Metrics
    earnings_per_share NUMERIC(20, 4),
    book_value_per_share NUMERIC(20, 4),
    free_cash_flow_per_share NUMERIC(20, 4),

    -- Dividend Metrics
    payout_ratio NUMERIC(10, 4),
    dividend_yield NUMERIC(10, 4),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(cik, report_period, period_type)
);

CREATE INDEX idx_metrics_ticker ON financial_metrics(ticker);
CREATE INDEX idx_metrics_cik ON financial_metrics(cik);
CREATE INDEX idx_metrics_period ON financial_metrics(report_period);

-- News Articles
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    title TEXT NOT NULL,
    author VARCHAR(255),
    source VARCHAR(100),  -- Reuters, Investing.com, Motley Fool, etc.
    published_date TIMESTAMP NOT NULL,
    url TEXT UNIQUE NOT NULL,
    content TEXT,
    sentiment VARCHAR(20),  -- positive, negative, neutral
    sentiment_score NUMERIC(5, 4),  -- -1 to 1
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_ticker ON news_articles(ticker);
CREATE INDEX idx_news_published ON news_articles(published_date);
CREATE INDEX idx_news_source ON news_articles(source);

-- API Keys (for authentication)
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_hash VARCHAR(64) UNIQUE NOT NULL,  -- bcrypt hash of API key
    user_id INTEGER,  -- Reference to users table if you have one
    tier VARCHAR(20) NOT NULL,  -- free, developer, pro, enterprise
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- API Usage Tracking
CREATE TABLE api_usage (
    id SERIAL PRIMARY KEY,
    api_key_id INTEGER REFERENCES api_keys(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Convert to TimescaleDB hypertable
-- SELECT create_hypertable('api_usage', 'timestamp');

CREATE INDEX idx_usage_key ON api_usage(api_key_id);
CREATE INDEX idx_usage_timestamp ON api_usage(timestamp);
```

#### Supporting Tables

```sql
-- CUSIP to Ticker Mapping
CREATE TABLE cusip_mappings (
    cusip VARCHAR(9) PRIMARY KEY,
    ticker VARCHAR(10),
    company_name VARCHAR(255),
    is_eligible_13f BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cusip_ticker ON cusip_mappings(ticker);

-- Analyst Estimates (if generating your own)
CREATE TABLE analyst_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    fiscal_period DATE,
    period_type VARCHAR(10),  -- annual, quarterly
    estimate_type VARCHAR(50),  -- eps, revenue, ebitda, etc.
    estimate_value NUMERIC(20, 4),
    number_of_analysts INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(ticker, fiscal_period, period_type, estimate_type)
);

-- Segmented Revenues
CREATE TABLE segmented_revenues (
    id SERIAL PRIMARY KEY,
    cik VARCHAR(10) REFERENCES companies(cik),
    ticker VARCHAR(10),
    report_period DATE NOT NULL,
    period_type VARCHAR(10) NOT NULL,
    segment_type VARCHAR(20),  -- geographic, business
    segment_name VARCHAR(255),
    revenue NUMERIC(20, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_segment_ticker ON segmented_revenues(ticker);
CREATE INDEX idx_segment_period ON segmented_revenues(report_period);
```

### Data Ingestion Pipeline Implementation

#### 1. SEC EDGAR Financial Statements Ingestion

**File:** `ingestion/edgar_financials.py`

```python
import requests
import zipfile
import json
from io import BytesIO
from datetime import datetime
from typing import Dict, List
import pandas as pd
from edgar import Company, set_identity
from database import db_session
from models import (
    companies, income_statements, balance_sheets,
    cash_flow_statements, sec_filings
)

# Set your identity (required by SEC)
set_identity("your.name@yourcompany.com")

class EdgarFinancialsIngestion:
    """Ingest financial statements from SEC EDGAR"""

    BASE_URL = "https://data.sec.gov"
    BULK_URL = "https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip"
    HEADERS = {"User-Agent": "YourCompany yourname@yourcompany.com"}

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)
        self.rate_limit_delay = 0.1  # 10 requests/second

    def download_bulk_companyfacts(self, output_dir: str = "data/companyfacts"):
        """Download companyfacts.zip (all company XBRL data)"""
        print("Downloading companyfacts.zip...")
        response = self.session.get(self.BULK_URL)
        response.raise_for_status()

        zip_file = zipfile.ZipFile(BytesIO(response.content))
        zip_file.extractall(output_dir)
        print(f"Extracted {len(zip_file.namelist())} company files")

        return zip_file.namelist()

    def get_company_facts(self, cik: str) -> Dict:
        """Get all XBRL facts for a company"""
        cik_padded = cik.zfill(10)
        url = f"{self.BASE_URL}/api/xbrl/companyfacts/CIK{cik_padded}.json"

        response = self.session.get(url)
        response.raise_for_status()

        return response.json()

    def parse_financial_statements_edgartools(self, ticker: str, cik: str):
        """Use edgartools library to parse financial statements"""
        try:
            company = Company(ticker)
            financials = company.get_financials()

            # Get all periods
            income_stmt = financials.income_statement()
            balance_sheet = financials.balance_sheet()
            cash_flow = financials.cash_flow_statement()

            # Convert to DataFrames
            income_df = income_stmt.to_pandas() if income_stmt else None
            balance_df = balance_sheet.to_pandas() if balance_sheet else None
            cashflow_df = cash_flow.to_pandas() if cash_flow else None

            return {
                "income": income_df,
                "balance": balance_df,
                "cashflow": cashflow_df
            }

        except Exception as e:
            print(f"Error parsing {ticker}: {e}")
            return None

    def store_income_statement(self, cik: str, ticker: str, data: pd.DataFrame):
        """Store income statement data in database"""
        for idx, row in data.iterrows():
            stmt = {
                "cik": cik,
                "ticker": ticker,
                "report_period": row.get("period"),
                "fiscal_period": row.get("fiscal_period"),
                "period_type": row.get("period_type"),
                "currency": "USD",
                "revenue": row.get("revenue"),
                "cost_of_revenue": row.get("cost_of_revenue"),
                "gross_profit": row.get("gross_profit"),
                "operating_expense": row.get("operating_expense"),
                "selling_general_and_administrative_expenses": row.get("sga"),
                "research_and_development": row.get("r_and_d"),
                "operating_income": row.get("operating_income"),
                "interest_expense": row.get("interest_expense"),
                "ebit": row.get("ebit"),
                "income_tax_expense": row.get("income_tax_expense"),
                "net_income": row.get("net_income"),
                "earnings_per_share": row.get("eps"),
                "earnings_per_share_diluted": row.get("eps_diluted"),
                "weighted_average_shares": row.get("shares"),
                "weighted_average_shares_diluted": row.get("shares_diluted"),
            }

            # Upsert to database
            db_session.execute(
                income_statements.insert().values(**stmt)
                .on_conflict_do_update(
                    index_elements=["cik", "report_period", "period_type"],
                    set_=stmt
                )
            )

        db_session.commit()

    def ingest_company(self, ticker: str, cik: str):
        """Complete ingestion for one company"""
        print(f"Ingesting {ticker} (CIK: {cik})...")

        # Parse using edgartools
        financials = self.parse_financial_statements_edgartools(ticker, cik)

        if not financials:
            return

        # Store each statement type
        if financials["income"] is not None:
            self.store_income_statement(cik, ticker, financials["income"])

        if financials["balance"] is not None:
            self.store_balance_sheet(cik, ticker, financials["balance"])

        if financials["cashflow"] is not None:
            self.store_cash_flow(cik, ticker, financials["cashflow"])

        print(f"✓ Completed {ticker}")

    def ingest_all_sp500(self):
        """Ingest all S&P 500 companies"""
        # Get S&P 500 list (from Wikipedia or manual CSV)
        sp500 = pd.read_csv("data/sp500_companies.csv")

        for _, row in sp500.iterrows():
            try:
                self.ingest_company(row["ticker"], row["cik"])
            except Exception as e:
                print(f"Failed {row['ticker']}: {e}")

# Usage
if __name__ == "__main__":
    ingestion = EdgarFinancialsIngestion()
    ingestion.ingest_all_sp500()
```

#### 2. 13F Institutional Holdings Ingestion

**File:** `ingestion/edgar_13f.py`

```python
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from database import db_session
from models import institutional_investors, institutional_holdings

class Form13FIngestion:
    """Ingest 13F institutional holdings data"""

    BASE_URL = "https://www.sec.gov"
    HEADERS = {"User-Agent": "YourCompany yourname@yourcompany.com"}

    def get_13f_filings(self, cik: str, start_date: str = "2020-01-01"):
        """Get list of 13F filings for an investor"""
        url = f"{self.BASE_URL}/cgi-bin/browse-edgar"
        params = {
            "action": "getcompany",
            "CIK": cik,
            "type": "13F-HR",
            "dateb": "",
            "owner": "exclude",
            "count": 100,
            "output": "xml"
        }

        response = requests.get(url, params=params, headers=self.HEADERS)
        response.raise_for_status()

        # Parse XML response
        root = ET.fromstring(response.content)
        filings = []

        for filing in root.findall(".//filing"):
            filing_date = filing.find("filingDate").text
            if filing_date >= start_date:
                filings.append({
                    "accession_number": filing.find("accessionNumber").text,
                    "filing_date": filing_date,
                    "report_date": filing.find("reportDate").text,
                    "file_number": filing.find("fileNumber").text
                })

        return filings

    def parse_13f_xml(self, accession_number: str):
        """Parse 13F-HR XML filing to extract holdings"""
        # Format: 0001234567-20-123456 -> 000123456720123456
        acc_no_clean = accession_number.replace("-", "")

        # Build XML URL
        # https://www.sec.gov/Archives/edgar/data/CIK/ACCESSION/FILING.xml
        # This requires mapping accession to document path

        xml_url = f"{self.BASE_URL}/cgi-bin/viewer?action=view&cik={cik}&accession_number={accession_number}&xbrl_type=v"

        response = requests.get(xml_url, headers=self.HEADERS)
        response.raise_for_status()

        root = ET.fromstring(response.content)

        holdings = []

        # Parse holdings (format varies, but generally in informationTable)
        for holding in root.findall(".//infoTable"):
            try:
                holding_data = {
                    "cusip": holding.find(".//cusip").text,
                    "name": holding.find(".//nameOfIssuer").text,
                    "title_of_class": holding.find(".//titleOfClass").text,
                    "shares": int(holding.find(".//shrsOrPrnAmt/sshPrnamt").text),
                    "market_value": float(holding.find(".//value").text),  # In thousands
                    "investment_discretion": holding.find(".//investmentDiscretion").text,
                    "voting_authority_sole": int(holding.find(".//votingAuthority/Sole").text or 0),
                    "voting_authority_shared": int(holding.find(".//votingAuthority/Shared").text or 0),
                    "voting_authority_none": int(holding.find(".//votingAuthority/None").text or 0),
                }
                holdings.append(holding_data)
            except Exception as e:
                print(f"Error parsing holding: {e}")
                continue

        return holdings

    def store_13f_holdings(self, investor_cik: str, report_period: str,
                          filing_date: str, holdings: list):
        """Store 13F holdings in database"""
        for holding in holdings:
            # Map CUSIP to ticker
            ticker = self.get_ticker_from_cusip(holding["cusip"])

            data = {
                "investor_cik": investor_cik,
                "ticker": ticker,
                "cusip": holding["cusip"],
                "report_period": report_period,
                "filing_date": filing_date,
                "shares": holding["shares"],
                "market_value": holding["market_value"],
                "price": holding["market_value"] * 1000 / holding["shares"] if holding["shares"] > 0 else None,
                "investment_discretion": holding.get("investment_discretion"),
                "voting_authority_sole": holding.get("voting_authority_sole"),
                "voting_authority_shared": holding.get("voting_authority_shared"),
                "voting_authority_none": holding.get("voting_authority_none"),
            }

            # Upsert
            db_session.execute(
                institutional_holdings.insert().values(**data)
                .on_conflict_do_update(
                    index_elements=["investor_cik", "cusip", "report_period"],
                    set_=data
                )
            )

        db_session.commit()

    def get_ticker_from_cusip(self, cusip: str) -> str:
        """Map CUSIP to ticker symbol"""
        # Query cusip_mappings table or use external service
        result = db_session.execute(
            "SELECT ticker FROM cusip_mappings WHERE cusip = %s",
            (cusip,)
        ).fetchone()

        return result[0] if result else None

    def ingest_investor(self, investor_cik: str, investor_name: str):
        """Ingest all 13F filings for an investor"""
        print(f"Ingesting {investor_name} (CIK: {investor_cik})...")

        # Store investor info
        db_session.execute(
            institutional_investors.insert().values(
                cik=investor_cik,
                name=investor_name,
                normalized_name=investor_name.upper().replace(" ", "_")
            ).on_conflict_do_nothing()
        )
        db_session.commit()

        # Get all 13F filings
        filings = self.get_13f_filings(investor_cik)

        for filing in filings:
            try:
                holdings = self.parse_13f_xml(filing["accession_number"])
                self.store_13f_holdings(
                    investor_cik,
                    filing["report_date"],
                    filing["filing_date"],
                    holdings
                )
                print(f"✓ Filed {filing['filing_date']}: {len(holdings)} holdings")
            except Exception as e:
                print(f"Failed {filing['accession_number']}: {e}")

# Usage
if __name__ == "__main__":
    ingestion = Form13FIngestion()

    # Major institutional investors
    investors = [
        ("0001067983", "BERKSHIRE HATHAWAY INC"),
        ("0001350694", "VANGUARD GROUP INC"),
        ("0001364742", "BLACKROCK INC"),
        ("0000315066", "TIGER GLOBAL MANAGEMENT LLC"),
    ]

    for cik, name in investors:
        ingestion.ingest_investor(cik, name)
```

#### 3. Form 4 Insider Trades Ingestion

**File:** `ingestion/edgar_form4.py`

```python
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from database import db_session
from models import insiders, insider_trades

class Form4Ingestion:
    """Ingest Form 4 insider trading data"""

    BASE_URL = "https://www.sec.gov"
    HEADERS = {"User-Agent": "YourCompany yourname@yourcompany.com"}

    def get_form4_filings(self, ticker: str, cik: str, start_date: str = "2020-01-01"):
        """Get list of Form 4 filings for a company"""
        url = f"{self.BASE_URL}/cgi-bin/browse-edgar"
        params = {
            "action": "getcompany",
            "CIK": cik,
            "type": "4",
            "dateb": "",
            "owner": "include",  # Include insider filings
            "count": 100,
            "output": "xml"
        }

        response = requests.get(url, params=params, headers=self.HEADERS)
        response.raise_for_status()

        root = ET.fromstring(response.content)
        filings = []

        for filing in root.findall(".//filing"):
            filing_date = filing.find("filingDate").text
            if filing_date >= start_date:
                filings.append({
                    "accession_number": filing.find("accessionNumber").text,
                    "filing_date": filing_date,
                    "filing_href": filing.find("filingHref").text
                })

        return filings

    def parse_form4_xml(self, accession_number: str, filing_href: str):
        """Parse Form 4 XML to extract insider transactions"""
        # Get XML document
        xml_url = filing_href.replace(".html", ".xml")
        response = requests.get(xml_url, headers=self.HEADERS)
        response.raise_for_status()

        root = ET.fromstring(response.content)

        # Extract reporting owner info
        owner = root.find(".//reportingOwner")
        owner_name = owner.find(".//rptOwnerName").text
        owner_cik = owner.find(".//rptOwnerCik").text

        # Extract relationships
        relationship = owner.find(".//reportingOwnerRelationship")
        is_director = relationship.find("isDirector").text == "1"
        is_officer = relationship.find("isOfficer").text == "1"
        officer_title = relationship.find("officerTitle").text if is_officer else None
        is_ten_percent = relationship.find("isTenPercentOwner").text == "1"

        # Extract issuer info
        issuer = root.find(".//issuer")
        issuer_cik = issuer.find("issuerCik").text
        issuer_name = issuer.find("issuerName").text
        ticker = issuer.find("issuerTradingSymbol").text

        transactions = []

        # Parse non-derivative transactions
        for trans in root.findall(".//nonDerivativeTransaction"):
            try:
                security = trans.find(".//securityTitle/value").text

                trans_date = trans.find(".//transactionDate/value").text
                trans_code = trans.find(".//transactionCoding/transactionCode").text

                # Transaction amounts
                trans_shares_elem = trans.find(".//transactionAmounts/transactionShares/value")
                trans_shares = float(trans_shares_elem.text) if trans_shares_elem is not None else 0

                trans_price_elem = trans.find(".//transactionAmounts/transactionPricePerShare/value")
                trans_price = float(trans_price_elem.text) if trans_price_elem is not None else None

                acquired_disposed = trans.find(".//transactionAmounts/transactionAcquiredDisposedCode/value").text

                # Post-transaction ownership
                shares_owned_elem = trans.find(".//postTransactionAmounts/sharesOwnedFollowingTransaction/value")
                shares_owned_after = float(shares_owned_elem.text) if shares_owned_elem is not None else None

                # Calculate before
                if shares_owned_after is not None:
                    if acquired_disposed == "A":
                        shares_owned_before = shares_owned_after - trans_shares
                    else:
                        shares_owned_before = shares_owned_after + trans_shares
                else:
                    shares_owned_before = None

                transaction = {
                    "issuer_cik": issuer_cik,
                    "ticker": ticker,
                    "issuer": issuer_name,
                    "name": owner_name,
                    "title": officer_title,
                    "is_board_director": is_director,
                    "is_officer": is_officer,
                    "is_ten_percent_owner": is_ten_percent,
                    "transaction_date": trans_date,
                    "transaction_code": trans_code,
                    "transaction_shares": trans_shares,
                    "transaction_price_per_share": trans_price,
                    "transaction_value": trans_shares * trans_price if trans_price else None,
                    "shares_owned_before_transaction": shares_owned_before,
                    "shares_owned_after_transaction": shares_owned_after,
                    "security_title": security,
                    "security_acquired_disposed": acquired_disposed,
                    "accession_number": accession_number
                }

                transactions.append(transaction)

            except Exception as e:
                print(f"Error parsing transaction: {e}")
                continue

        return transactions

    def store_form4_trades(self, filing_date: str, transactions: list):
        """Store Form 4 transactions in database"""
        for trans in transactions:
            data = {**trans, "filing_date": filing_date}

            # Upsert
            db_session.execute(
                insider_trades.insert().values(**data)
                .on_conflict_do_update(
                    index_elements=["accession_number", "transaction_date", "name"],
                    set_=data
                )
            )

        db_session.commit()

    def ingest_company(self, ticker: str, cik: str):
        """Ingest all Form 4 filings for a company"""
        print(f"Ingesting insider trades for {ticker} (CIK: {cik})...")

        filings = self.get_form4_filings(ticker, cik)

        for filing in filings:
            try:
                transactions = self.parse_form4_xml(
                    filing["accession_number"],
                    filing["filing_href"]
                )

                if transactions:
                    self.store_form4_trades(filing["filing_date"], transactions)
                    print(f"✓ {filing['filing_date']}: {len(transactions)} transactions")

            except Exception as e:
                print(f"Failed {filing['accession_number']}: {e}")

# Usage
if __name__ == "__main__":
    ingestion = Form4Ingestion()

    # S&P 500 companies
    sp500 = pd.read_csv("data/sp500_companies.csv")
    for _, row in sp500.iterrows():
        ingestion.ingest_company(row["ticker"], row["cik"])
```

#### 4. Celery Task Scheduling

**File:** `tasks/celery_app.py`

```python
from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "financial_data_ingestion",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/New_York",
    enable_utc=True,
)

# Scheduled tasks
celery_app.conf.beat_schedule = {
    "ingest-financials-daily": {
        "task": "tasks.ingest_financials",
        "schedule": crontab(hour=4, minute=0),  # 4 AM ET daily
    },
    "ingest-13f-quarterly": {
        "task": "tasks.ingest_13f",
        "schedule": crontab(day_of_month=1, hour=5, minute=0),  # 1st of month
    },
    "ingest-form4-daily": {
        "task": "tasks.ingest_form4",
        "schedule": crontab(hour=20, minute=0),  # 8 PM ET daily
    },
    "compute-metrics-daily": {
        "task": "tasks.compute_metrics",
        "schedule": crontab(hour=6, minute=0),  # 6 AM ET daily
    },
}

@celery_app.task(name="tasks.ingest_financials")
def ingest_financials():
    """Daily financial statements ingestion"""
    from ingestion.edgar_financials import EdgarFinancialsIngestion
    ingestion = EdgarFinancialsIngestion()
    ingestion.ingest_all_sp500()

@celery_app.task(name="tasks.ingest_13f")
def ingest_13f():
    """Quarterly 13F ingestion"""
    from ingestion.edgar_13f import Form13FIngestion
    ingestion = Form13FIngestion()
    # Ingest major investors
    investors = [
        ("0001067983", "BERKSHIRE HATHAWAY INC"),
        ("0001350694", "VANGUARD GROUP INC"),
        # ... more
    ]
    for cik, name in investors:
        ingestion.ingest_investor(cik, name)

@celery_app.task(name="tasks.ingest_form4")
def ingest_form4():
    """Daily insider trades ingestion"""
    from ingestion.edgar_form4 import Form4Ingestion
    ingestion = Form4Ingestion()
    # Ingest S&P 500
    sp500 = pd.read_csv("data/sp500_companies.csv")
    for _, row in sp500.iterrows():
        ingestion.ingest_company(row["ticker"], row["cik"])

@celery_app.task(name="tasks.compute_metrics")
def compute_metrics():
    """Compute financial metrics"""
    from calculations.metrics import MetricsCalculator
    calculator = MetricsCalculator()
    calculator.compute_all()
```

### API Implementation (FastAPI)

**File:** `main.py`

```python
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from database import get_db
from auth import verify_api_key

app = FastAPI(
    title="Financial Data API",
    description="Stock market data API - 30,000+ tickers, 30+ years",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for rate limiting
@app.on_event("startup")
async def startup():
    redis_connection = redis.from_url("redis://localhost:6379", encoding="utf8")
    await FastAPILimiter.init(redis_connection)

# Response models
class IncomeStatement(BaseModel):
    ticker: str
    report_period: date
    fiscal_period: str
    period: str
    currency: str
    revenue: Optional[float]
    cost_of_revenue: Optional[float]
    gross_profit: Optional[float]
    operating_expense: Optional[float]
    operating_income: Optional[float]
    net_income: Optional[float]
    earnings_per_share: Optional[float]
    earnings_per_share_diluted: Optional[float]

class IncomeStatementsResponse(BaseModel):
    income_statements: List[IncomeStatement]

# Endpoints
@app.get("/financials/income-statements",
         response_model=IncomeStatementsResponse,
         dependencies=[Depends(RateLimiter(times=1000, minutes=1))])
async def get_income_statements(
    ticker: str,
    period: str,  # annual, quarterly, ttm
    limit: int = 4,
    report_period_gte: Optional[date] = None,
    report_period_lte: Optional[date] = None,
    x_api_key: str = Header(...),
    db = Depends(get_db)
):
    """Get income statements for a ticker"""

    # Verify API key
    api_key_data = verify_api_key(x_api_key, db)
    if not api_key_data:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Query database
    query = """
        SELECT * FROM income_statements
        WHERE ticker = %s AND period_type = %s
    """
    params = [ticker, period]

    if report_period_gte:
        query += " AND report_period >= %s"
        params.append(report_period_gte)

    if report_period_lte:
        query += " AND report_period <= %s"
        params.append(report_period_lte)

    query += " ORDER BY report_period DESC LIMIT %s"
    params.append(limit)

    result = db.execute(query, params).fetchall()

    if not result:
        raise HTTPException(status_code=404, detail="No data found")

    income_statements = [
        IncomeStatement(**dict(row)) for row in result
    ]

    return IncomeStatementsResponse(income_statements=income_statements)

# Similarly implement all other endpoints...
# - /financials/balance-sheets
# - /financials/cash-flow-statements
# - /institutional-ownership
# - /insider-trades
# - /filings
# - /financial-metrics
# - /news
# etc.
```

### Financial Metrics Calculation

**File:** `calculations/metrics.py`

```python
import pandas as pd
from database import db_session

class MetricsCalculator:
    """Calculate financial metrics from raw financial statements"""

    def compute_all(self):
        """Compute metrics for all companies"""
        # Get list of all companies with recent financials
        query = """
            SELECT DISTINCT ticker, cik
            FROM income_statements
            WHERE report_period >= CURRENT_DATE - INTERVAL '5 years'
        """
        companies = pd.read_sql(query, db_session.bind)

        for _, row in companies.iterrows():
            try:
                self.compute_company_metrics(row["ticker"], row["cik"])
            except Exception as e:
                print(f"Error computing metrics for {row['ticker']}: {e}")

    def compute_company_metrics(self, ticker: str, cik: str):
        """Compute all metrics for a company"""
        # Get financial statements
        income = self.get_income_statements(ticker)
        balance = self.get_balance_sheets(ticker)
        cashflow = self.get_cash_flows(ticker)
        prices = self.get_stock_prices(ticker)

        # Merge on report_period
        df = income.merge(balance, on=["ticker", "report_period", "period_type"], how="outer")
        df = df.merge(cashflow, on=["ticker", "report_period", "period_type"], how="outer")
        df = df.merge(prices, left_on="report_period", right_on="date", how="left")

        # Calculate metrics
        metrics = []

        for _, row in df.iterrows():
            metric = self.calculate_metrics_row(row)
            metrics.append(metric)

        # Store in database
        self.store_metrics(metrics)

    def calculate_metrics_row(self, row: pd.Series) -> dict:
        """Calculate all metrics for a single period"""
        metrics = {
            "ticker": row["ticker"],
            "cik": row["cik"],
            "report_period": row["report_period"],
            "period_type": row["period_type"],
        }

        # Valuation metrics
        if row.get("close") and row.get("outstanding_shares"):
            metrics["market_cap"] = row["close"] * row["outstanding_shares"]

        if row.get("market_cap") and row.get("total_debt") and row.get("cash_and_equivalents"):
            metrics["enterprise_value"] = (
                row["market_cap"] + row["total_debt"] - row["cash_and_equivalents"]
            )

        if row.get("market_cap") and row.get("net_income"):
            metrics["pe_ratio"] = row["market_cap"] / row["net_income"]

        if row.get("close") and row.get("shareholders_equity") and row.get("outstanding_shares"):
            book_value_per_share = row["shareholders_equity"] / row["outstanding_shares"]
            metrics["price_to_book"] = row["close"] / book_value_per_share

        if row.get("market_cap") and row.get("revenue"):
            metrics["price_to_sales"] = row["market_cap"] / row["revenue"]

        # Profitability metrics
        if row.get("revenue"):
            if row.get("gross_profit"):
                metrics["gross_margin"] = row["gross_profit"] / row["revenue"]

            if row.get("operating_income"):
                metrics["operating_margin"] = row["operating_income"] / row["revenue"]

            if row.get("net_income"):
                metrics["net_margin"] = row["net_income"] / row["revenue"]

        if row.get("net_income") and row.get("shareholders_equity"):
            metrics["return_on_equity"] = row["net_income"] / row["shareholders_equity"]

        if row.get("net_income") and row.get("total_assets"):
            metrics["return_on_assets"] = row["net_income"] / row["total_assets"]

        # Liquidity metrics
        if row.get("current_assets") and row.get("current_liabilities"):
            metrics["current_ratio"] = row["current_assets"] / row["current_liabilities"]

        if row.get("cash_and_equivalents") and row.get("current_liabilities"):
            quick_assets = (
                row["cash_and_equivalents"] +
                row.get("marketable_securities", 0) +
                row.get("accounts_receivable", 0)
            )
            metrics["quick_ratio"] = quick_assets / row["current_liabilities"]

        # Leverage metrics
        if row.get("total_debt") and row.get("shareholders_equity"):
            metrics["debt_to_equity"] = row["total_debt"] / row["shareholders_equity"]

        if row.get("total_debt") and row.get("total_assets"):
            metrics["debt_to_assets"] = row["total_debt"] / row["total_assets"]

        if row.get("operating_income") and row.get("interest_expense"):
            metrics["interest_coverage"] = row["operating_income"] / row["interest_expense"]

        # Free cash flow
        if row.get("net_cash_flow_from_operations") and row.get("capital_expenditure"):
            metrics["free_cash_flow"] = (
                row["net_cash_flow_from_operations"] - abs(row["capital_expenditure"])
            )

        return metrics

    def store_metrics(self, metrics: list):
        """Store calculated metrics in database"""
        for metric in metrics:
            db_session.execute(
                """
                INSERT INTO financial_metrics (
                    ticker, cik, report_period, period_type,
                    market_cap, enterprise_value, pe_ratio, price_to_book,
                    price_to_sales, gross_margin, operating_margin, net_margin,
                    return_on_equity, return_on_assets, current_ratio,
                    quick_ratio, debt_to_equity, debt_to_assets,
                    interest_coverage, free_cash_flow
                ) VALUES (
                    %(ticker)s, %(cik)s, %(report_period)s, %(period_type)s,
                    %(market_cap)s, %(enterprise_value)s, %(pe_ratio)s,
                    %(price_to_book)s, %(price_to_sales)s, %(gross_margin)s,
                    %(operating_margin)s, %(net_margin)s, %(return_on_equity)s,
                    %(return_on_assets)s, %(current_ratio)s, %(quick_ratio)s,
                    %(debt_to_equity)s, %(debt_to_assets)s, %(interest_coverage)s,
                    %(free_cash_flow)s
                )
                ON CONFLICT (cik, report_period, period_type)
                DO UPDATE SET
                    market_cap = EXCLUDED.market_cap,
                    enterprise_value = EXCLUDED.enterprise_value,
                    pe_ratio = EXCLUDED.pe_ratio,
                    -- ... update all fields
                """,
                metric
            )

        db_session.commit()
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up PostgreSQL database with TimescaleDB
- [ ] Implement database schema
- [ ] Set up Redis for caching
- [ ] Create FastAPI project structure
- [ ] Implement API authentication (API keys)
- [ ] Set up Celery for background tasks

### Phase 2: Core Data Ingestion (Weeks 3-4)
- [ ] Implement SEC EDGAR financial statements ingestion
  - [ ] Use edgartools library
  - [ ] Parse 10-K, 10-Q filings
  - [ ] Store income statements, balance sheets, cash flows
- [ ] Implement CUSIP to ticker mapping
- [ ] Create S&P 500 initial dataset
- [ ] Set up daily ingestion schedule

### Phase 3: Ownership Data (Week 5)
- [ ] Implement 13F institutional holdings parser
- [ ] Download quarterly 13F filings
- [ ] Parse XML format (post-2013)
- [ ] Store holdings with changes tracking
- [ ] Create investor profiles

### Phase 4: Insider Trading (Week 6)
- [ ] Implement Form 4 parser
- [ ] Extract insider transactions
- [ ] Link insiders to companies
- [ ] Calculate ownership changes
- [ ] Set up real-time ingestion

### Phase 5: Financial Metrics (Week 7)
- [ ] Implement metrics calculation engine
- [ ] Calculate all 43 metrics
- [ ] Store computed metrics
- [ ] Create YoY and QoQ growth calculations
- [ ] Implement TTM (Trailing Twelve Months) logic

### Phase 6: API Development (Week 8)
- [ ] Implement all REST endpoints
- [ ] Add request validation
- [ ] Implement response caching
- [ ] Add pagination
- [ ] Create OpenAPI documentation
- [ ] Implement rate limiting per tier

### Phase 7: Market Data & News (Week 9)
- [ ] Integrate market data provider (Alpha Vantage, IEX Cloud, or Polygon.io)
- [ ] Implement news RSS feed ingestion
- [ ] Add sentiment analysis (basic)
- [ ] Store and serve news articles

### Phase 8: Testing & Optimization (Week 10)
- [ ] Unit tests for all parsers
- [ ] Integration tests for API
- [ ] Performance optimization
- [ ] Database query optimization
- [ ] Caching strategy refinement

### Phase 9: Documentation & Deployment (Week 11-12)
- [ ] Complete API documentation
- [ ] Create developer guides
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Deploy to production
- [ ] Set up CI/CD pipeline

### Phase 10: Additional Features (Future)
- [ ] Analyst estimates (build models or integrate provider)
- [ ] Segmented revenues parsing
- [ ] International stocks (20-F, 40-F, 6-K)
- [ ] Options data
- [ ] Economic indicators (FRED API)
- [ ] WebSocket support for real-time updates

---

## 6. Cost Estimates

### Infrastructure Costs (Monthly)

**Development Environment:**
- PostgreSQL + TimescaleDB (Self-hosted): Free
- Redis (Self-hosted): Free
- FastAPI (Self-hosted): Free
- **Total Development:** $0

**Production (AWS example):**
- RDS PostgreSQL (db.m5.xlarge): ~$280/month
- ElastiCache Redis (cache.m5.large): ~$120/month
- EC2 API Servers (2x t3.medium): ~$60/month
- EC2 Background Workers (2x t3.small): ~$30/month
- S3 Storage (backups, logs): ~$20/month
- CloudWatch, Data Transfer: ~$50/month
- **Total Production:** ~$560/month

**Alternative (DigitalOcean/Hetzner):**
- Managed PostgreSQL (4GB): ~$60/month
- Managed Redis (2GB): ~$30/month
- 2x Droplets (4GB): ~$48/month
- **Total:** ~$138/month

### Data Source Costs

**SEC EDGAR Data:** FREE
- All financial statements, 13F, Form 4: $0
- Bulk downloads: $0
- Rate limit: 10 req/sec (free)

**Market Price Data (Choose one):**
- **Alpha Vantage:**
  - Free: 25 requests/day
  - Premium: $50-$150/month
- **IEX Cloud:**
  - Free: 50,000 messages/month
  - Launch: $9/month (5M messages)
  - Grow: $99/month (100M messages)
- **Polygon.io:**
  - Starter: $29/month (stocks only)
  - Developer: $99/month (all data)
- **Recommended:** IEX Cloud ($9-$99/month)

**News Data:**
- RSS Feeds: FREE (Reuters, Investing.com public feeds)
- NewsAPI.org: Free tier or $449/month for premium

### Total Monthly Costs

**Minimum (Development):** $0-$9/month
**Small Production (< 100 users):** $140-$200/month
**Medium Production (< 1000 users):** $560-$700/month
**Large Production (10,000+ users):** $2,000+/month

---

## 7. Key Differences & Improvements

### Advantages of Building Your Own

1. **No API Costs:** No per-request fees (only infrastructure)
2. **Unlimited Rate Limits:** Full control over throughput
3. **Custom Features:** Add any metrics, filters, or aggregations
4. **Data Ownership:** Complete control over data storage and retention
5. **Privacy:** No third-party seeing your queries
6. **Flexibility:** Integrate any data sources you want

### Challenges

1. **Data Quality:** Need robust error handling and validation
2. **Maintenance:** SEC format changes require updates
3. **Historical Data:** Building 30 years of history takes time
4. **Market Data:** Still need external provider for real-time prices
5. **Scale:** Database optimization crucial for performance

### Recommended Shortcuts

1. **Start Small:** S&P 500 only (500 companies vs 30,000)
2. **Use Libraries:** edgartools, py-xbrl (don't parse from scratch)
3. **Selective History:** Last 5-10 years instead of 30
4. **Caching:** Aggressive caching of computed metrics
5. **Batch Processing:** Process filings in bulk overnight

---

## Sources

- [Financial Datasets API Documentation](https://docs.financialdatasets.ai/introduction)
- [Financial Datasets Pricing](https://www.financialdatasets.ai/pricing)
- [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [SEC Form 13F Data Sets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets)
- [Form 13F Data | Institutional Holdings](https://elsaifym.github.io/EDGAR-Parsing/)
- [SEC Insider Transactions Data Sets](https://www.sec.gov/files/insider_transactions_readme.pdf)
- [SEC Financial Statement Data Sets](https://www.sec.gov/dera/data/financial-statement-data-sets)
- [GitHub - dgunning/edgartools](https://github.com/dgunning/edgartools)
- [GitHub - virattt/dexter](https://github.com/virattt/dexter)
- [GitHub - virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund)
- [GitHub - virattt/financial-datasets](https://github.com/virattt/financial-datasets)
- [GitHub - manusimidt/py-xbrl](https://github.com/manusimidt/py-xbrl)
- [GitHub - elsaifym/EDGAR-Parsing](https://github.com/elsaifym/EDGAR-Parsing)
- [Comprehensive Guide to SEC EDGAR API and Database](https://daloopa.com/blog/analyst-best-practices/comprehensive-guide-to-sec-edgar-api-and-database)
- [How to do Agentic RAG on SEC EDGAR Filings](https://www.captide.ai/insights/how-to-do-agentic-rag-on-sec-edgar-filings)
- [Extract Financial Statements from SEC Filings with Python](https://sec-api.io/resources/extract-financial-statements-from-sec-filings-and-xbrl-data-with-python)
