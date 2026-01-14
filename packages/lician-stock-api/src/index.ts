/**
 * @lician/stock-api - Free stock market data API client
 *
 * Get real-time stock quotes, financial statements, insider trades,
 * institutional holdings, and more from lician.com
 *
 * @example
 * ```typescript
 * import { LicianAPI } from '@lician/stock-api';
 *
 * const api = new LicianAPI();
 * const quote = await api.getQuote('AAPL');
 * console.log(quote.price); // 185.92
 * ```
 *
 * @see https://lician.com/api-docs
 */

const BASE_URL = 'https://lician.com';

export interface StockQuote {
  ticker: string;
  price: number;
  dayChange: number;
  dayChangePercent: number;
  volume: number;
  marketCap?: number;
  time?: string;
}

export interface IncomeStatement {
  ticker: string;
  reportPeriod: string;
  period: 'quarterly' | 'annual';
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps?: number;
}

export interface BalanceSheet {
  ticker: string;
  reportPeriod: string;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  cash?: number;
  debt?: number;
}

export interface CashFlowStatement {
  ticker: string;
  reportPeriod: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow: number;
}

export interface InsiderTrade {
  ticker: string;
  insiderName: string;
  insiderTitle: string;
  transactionType: string;
  shares: number;
  price: number;
  value: number;
  filingDate: string;
}

export interface InstitutionalHolding {
  ticker: string;
  holderName: string;
  shares: number;
  value: number;
  percentOfShares: number;
  reportDate: string;
}

export interface LicianAPIOptions {
  baseUrl?: string;
  timeout?: number;
}

export class LicianAPI {
  private baseUrl: string;
  private timeout: number;

  constructor(options: LicianAPIOptions = {}) {
    this.baseUrl = options.baseUrl || BASE_URL;
    this.timeout = options.timeout || 30000;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@lician/stock-api',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get current stock quote
   * @param ticker Stock ticker symbol (e.g., 'AAPL')
   * @returns Current price, change, volume, and market cap
   * @example
   * ```typescript
   * const quote = await api.getQuote('AAPL');
   * console.log(`${quote.ticker}: $${quote.price} (${quote.dayChangePercent}%)`);
   * ```
   */
  async getQuote(ticker: string): Promise<StockQuote> {
    const data = await this.fetch<{ snapshot: any }>('/api/v1/prices/snapshot', { ticker });
    const s = data.snapshot;
    return {
      ticker: s.ticker,
      price: s.price,
      dayChange: s.day_change,
      dayChangePercent: s.day_change_percent,
      volume: s.volume,
      marketCap: s.market_cap,
      time: s.time,
    };
  }

  /**
   * Get income statements
   * @param ticker Stock ticker symbol
   * @param period 'quarterly' or 'annual' (default: quarterly)
   * @param limit Number of periods to return (default: 4)
   * @example
   * ```typescript
   * const statements = await api.getIncomeStatements('AAPL', 'quarterly', 4);
   * statements.forEach(s => console.log(`${s.reportPeriod}: $${s.revenue}`));
   * ```
   */
  async getIncomeStatements(
    ticker: string,
    period: 'quarterly' | 'annual' = 'quarterly',
    limit = 4
  ): Promise<IncomeStatement[]> {
    const data = await this.fetch<{ income_statements: any[] }>('/api/v1/financials/income-statements', {
      ticker,
      period,
      limit,
    });
    return data.income_statements.map((s) => ({
      ticker: s.ticker,
      reportPeriod: s.report_period,
      period: s.period,
      revenue: s.revenue,
      grossProfit: s.gross_profit,
      operatingIncome: s.operating_income,
      netIncome: s.net_income,
      eps: s.eps,
    }));
  }

  /**
   * Get balance sheets
   * @param ticker Stock ticker symbol
   * @param period 'quarterly' or 'annual' (default: quarterly)
   * @param limit Number of periods to return (default: 4)
   */
  async getBalanceSheets(
    ticker: string,
    period: 'quarterly' | 'annual' = 'quarterly',
    limit = 4
  ): Promise<BalanceSheet[]> {
    const data = await this.fetch<{ balance_sheets: any[] }>('/api/v1/financials/balance-sheets', {
      ticker,
      period,
      limit,
    });
    return data.balance_sheets.map((s) => ({
      ticker: s.ticker,
      reportPeriod: s.report_period,
      totalAssets: s.total_assets,
      totalLiabilities: s.total_liabilities,
      shareholdersEquity: s.shareholders_equity,
      cash: s.cash_and_equivalents,
      debt: s.total_debt,
    }));
  }

  /**
   * Get cash flow statements
   * @param ticker Stock ticker symbol
   * @param period 'quarterly' or 'annual' (default: quarterly)
   * @param limit Number of periods to return (default: 4)
   */
  async getCashFlowStatements(
    ticker: string,
    period: 'quarterly' | 'annual' = 'quarterly',
    limit = 4
  ): Promise<CashFlowStatement[]> {
    const data = await this.fetch<{ cash_flow_statements: any[] }>('/api/v1/financials/cash-flow-statements', {
      ticker,
      period,
      limit,
    });
    return data.cash_flow_statements.map((s) => ({
      ticker: s.ticker,
      reportPeriod: s.report_period,
      operatingCashFlow: s.operating_cash_flow,
      investingCashFlow: s.investing_cash_flow,
      financingCashFlow: s.financing_cash_flow,
      freeCashFlow: s.free_cash_flow,
    }));
  }

  /**
   * Get insider trades (SEC Form 4)
   * @param ticker Optional ticker to filter by
   * @param limit Number of trades to return (default: 50)
   * @example
   * ```typescript
   * const trades = await api.getInsiderTrades('AAPL', 10);
   * trades.forEach(t => console.log(`${t.insiderName} ${t.transactionType} ${t.shares} shares`));
   * ```
   */
  async getInsiderTrades(ticker?: string, limit = 50): Promise<InsiderTrade[]> {
    const params: Record<string, string | number> = { limit };
    if (ticker) params.ticker = ticker;

    const data = await this.fetch<{ insider_trades: any[] }>('/api/v1/insider-trades', params);
    return data.insider_trades.map((t) => ({
      ticker: t.ticker,
      insiderName: t.insider_name,
      insiderTitle: t.insider_title,
      transactionType: t.transaction_type,
      shares: t.shares,
      price: t.price,
      value: t.value,
      filingDate: t.filing_date,
    }));
  }

  /**
   * Get institutional holdings (13F filings)
   * @param ticker Stock ticker symbol
   * @param limit Number of holders to return (default: 20)
   * @example
   * ```typescript
   * const holdings = await api.getInstitutionalHoldings('AAPL', 10);
   * holdings.forEach(h => console.log(`${h.holderName}: ${h.percentOfShares}%`));
   * ```
   */
  async getInstitutionalHoldings(ticker: string, limit = 20): Promise<InstitutionalHolding[]> {
    const data = await this.fetch<{ holdings: any[] }>('/api/v1/institutional-ownership', {
      ticker,
      limit,
    });
    return data.holdings.map((h) => ({
      ticker: h.ticker,
      holderName: h.holder_name,
      shares: h.shares,
      value: h.value,
      percentOfShares: h.percent_of_shares,
      reportDate: h.report_date,
    }));
  }
}

// Default export for convenience
export default LicianAPI;

// Named exports for tree-shaking
export { LicianAPI as Lician };
