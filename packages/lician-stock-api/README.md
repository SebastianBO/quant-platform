# @lician/stock-api

Free stock market data API client for Node.js and browsers.

Get real-time stock quotes, financial statements, insider trades, institutional holdings, and more from [lician.com](https://lician.com).

## Installation

```bash
npm install @lician/stock-api
```

## Quick Start

```typescript
import { LicianAPI } from '@lician/stock-api';

const api = new LicianAPI();

// Get stock quote
const quote = await api.getQuote('AAPL');
console.log(`${quote.ticker}: $${quote.price} (${quote.dayChangePercent}%)`);

// Get financial statements
const income = await api.getIncomeStatements('AAPL', 'quarterly', 4);
income.forEach(s => console.log(`${s.reportPeriod}: Revenue $${s.revenue}`));

// Get insider trades
const trades = await api.getInsiderTrades('AAPL', 10);
trades.forEach(t => console.log(`${t.insiderName} ${t.transactionType} ${t.shares} shares`));
```

## API Methods

### Stock Quotes

```typescript
const quote = await api.getQuote('AAPL');
// Returns: { ticker, price, dayChange, dayChangePercent, volume, marketCap }
```

### Financial Statements

```typescript
// Income statements
const income = await api.getIncomeStatements('AAPL', 'quarterly', 4);
// Returns: [{ ticker, reportPeriod, revenue, grossProfit, operatingIncome, netIncome }]

// Balance sheets
const balance = await api.getBalanceSheets('AAPL', 'annual', 4);
// Returns: [{ ticker, reportPeriod, totalAssets, totalLiabilities, shareholdersEquity }]

// Cash flow statements
const cashflow = await api.getCashFlowStatements('AAPL');
// Returns: [{ ticker, reportPeriod, operatingCashFlow, freeCashFlow, ... }]
```

### Insider Trading

```typescript
// Get insider trades for a specific stock
const trades = await api.getInsiderTrades('AAPL', 10);
// Returns: [{ ticker, insiderName, insiderTitle, transactionType, shares, price, value }]

// Get all recent insider trades
const allTrades = await api.getInsiderTrades(undefined, 50);
```

### Institutional Holdings

```typescript
const holdings = await api.getInstitutionalHoldings('AAPL', 10);
// Returns: [{ ticker, holderName, shares, value, percentOfShares }]
```

## Data Coverage

- **10,000+** US stocks (NYSE, NASDAQ, AMEX)
- **Real-time quotes** (15-minute delay)
- **10+ years** of financial statements
- **SEC filings** (10-K, 10-Q, 8-K)
- **Insider trades** (Form 4)
- **Institutional holdings** (13F)

## Rate Limits

- **100 requests/minute** for anonymous users
- No API key required for basic access

## Links

- [API Documentation](https://lician.com/api-docs)
- [Embeddable Widget](https://lician.com/embed)
- [Stock Directory](https://lician.com/stocks)

## License

MIT

---

Made with data from [Lician](https://lician.com) - Free financial data for everyone.
