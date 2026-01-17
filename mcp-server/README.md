# Lician MCP Server

Model Context Protocol (MCP) server for the [Lician Financial Data API](https://lician.com/developers). Enables AI agents like Claude, GPT, and Gemini to access real-time stock prices, financial statements, insider trades, and institutional holdings.

## Features

- **17 Financial Data Tools** for comprehensive market analysis
- **141,000+ Companies** across US and European markets
- **Real-time Data** including prices, insider trades, and 13F filings
- **No API Key Required** for basic access (100 requests/day)
- **Works with** Claude Desktop, OpenAI Agents SDK, and any MCP-compatible client

## Installation

### For Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lician": {
      "command": "npx",
      "args": ["@lician/mcp-server"],
      "env": {
        "LICIAN_API_KEY": "your-api-key-optional"
      }
    }
  }
}
```

### Global Installation

```bash
npm install -g @lician/mcp-server
```

Then run:

```bash
lician-mcp
```

### From Source

```bash
git clone https://github.com/lician/mcp-server
cd mcp-server
npm install
npm run build
npm start
```

## Available Tools

### Stock Prices

| Tool | Description |
|------|-------------|
| `get_stock_price` | Current price, daily change, volume, market cap |
| `get_historical_prices` | Historical OHLCV data for charts and analysis |

### Financial Statements

| Tool | Description |
|------|-------------|
| `get_income_statement` | Revenue, gross profit, operating income, net income, EPS |
| `get_balance_sheet` | Assets, liabilities, equity, cash, debt |
| `get_cash_flow` | Operating, investing, financing cash flows, FCF |
| `get_financial_metrics` | P/E, P/B, ROE, ROA, margins, dividend yield |

### Insider Trading

| Tool | Description |
|------|-------------|
| `get_insider_trades` | SEC Form 4 buys/sells by executives and directors |

### Institutional Holdings

| Tool | Description |
|------|-------------|
| `get_institutional_holders` | 13F institutional ownership for a stock |
| `get_investor_portfolio` | All holdings for a specific fund/investor |

### Analyst Data

| Tool | Description |
|------|-------------|
| `get_analyst_ratings` | Buy/hold/sell ratings and price targets |
| `get_analyst_estimates` | EPS and revenue estimates for upcoming quarters |

### Company & News

| Tool | Description |
|------|-------------|
| `get_company_info` | Sector, industry, description, CEO, employees |
| `get_stock_news` | Recent news articles and headlines |
| `get_sec_filings` | 10-K, 10-Q, 8-K SEC filings |

### Crypto & Macro

| Tool | Description |
|------|-------------|
| `get_crypto_prices` | Bitcoin, Ethereum, and major crypto prices |
| `get_interest_rates` | Treasury yields and fed funds rate |

## Usage Examples

Once installed, you can ask Claude:

> "What's Apple's current stock price and how has it performed?"

Claude will use `get_stock_price` to fetch:

```json
{
  "snapshot": {
    "ticker": "AAPL",
    "price": 185.92,
    "day_change": 2.34,
    "day_change_percent": 1.27,
    "volume": 45234567,
    "market_cap": 2890000000000
  }
}
```

> "Show me insider trading activity at Tesla"

Claude will use `get_insider_trades`:

```json
{
  "insider_trades": [
    {
      "ticker": "TSLA",
      "insider_name": "Elon Musk",
      "insider_title": "CEO",
      "transaction_type": "S-Sale",
      "shares": 100000,
      "price": 245.50,
      "value": 24550000,
      "filing_date": "2026-01-15"
    }
  ]
}
```

> "What stocks does Berkshire Hathaway own?"

Claude will use `get_investor_portfolio`:

```json
{
  "investor": "Berkshire Hathaway",
  "total_value": 350000000000,
  "holdings": [
    {
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "shares": 905000000,
      "value": 168000000000,
      "percent_of_portfolio": 48.0
    }
  ]
}
```

## Authentication

### Free Tier (No API Key)

- 100 requests per day
- US market data only
- End-of-day prices

### With API Key

Set your API key as an environment variable:

```bash
export LICIAN_API_KEY=your-api-key
```

Or in Claude Desktop config:

```json
{
  "mcpServers": {
    "lician": {
      "command": "npx",
      "args": ["@lician/mcp-server"],
      "env": {
        "LICIAN_API_KEY": "your-api-key"
      }
    }
  }
}
```

### API Tiers

| Tier | Price | Requests/Day | Features |
|------|-------|--------------|----------|
| Free | $0 | 100 | US data, EOD prices |
| Basic | $29/mo | 10,000 | US + EU, real-time |
| Pro | $99/mo | 100,000 | All data, 13F, SEC |

Get an API key at [lician.com/developers/signup](https://lician.com/developers/signup)

## Data Coverage

- **US Companies**: 5,345 tickers (NYSE, NASDAQ, AMEX)
- **EU Companies**: 106,975 companies (UK, Norway, Sweden, Denmark, Finland)
- **Financial Records**: 839,000+
- **Data Types**: Prices, financials, insider trades, 13F, SEC filings, analyst ratings

## API Reference

For complete API documentation, see:

- [API Docs](https://lician.com/api-docs)
- [OpenAPI Spec](https://lician.com/openapi.json)
- [LLMs Context](https://lician.com/llms.txt)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## License

MIT

## Support

- Email: api@lician.com
- Documentation: [lician.com/developers](https://lician.com/developers)
- Issues: [GitHub Issues](https://github.com/lician/mcp-server/issues)

---

Built by [Lician](https://lician.com) - AI-Powered Financial Data Platform
