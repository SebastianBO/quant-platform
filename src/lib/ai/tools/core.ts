/**
 * Core financial data tools
 * Stock quotes, fundamentals, statements, insider trading, institutional ownership
 */

import { logger } from '@/lib/logger'
import { tool } from 'ai'
import { z } from 'zod'
import * as financialAPI from '../financial-datasets-api'
import {
  fetchWithRetry,
  withTimeout,
  createErrorResponse,
  getSupabase,
  getBaseUrl,
  hasFinancialAPI,
} from './utils'

/**
 * Tool: Get Stock Quote
 * Fetches real-time stock price and basic info with retry
 */
export const getStockQuoteTool = tool({
  description: 'Get real-time stock quote with price, change, volume, and market cap for a given ticker symbol',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol (e.g., AAPL, MSFT, TSLA)'),
  }),
  execute: async ({ ticker }) => {
    const t = ticker.toUpperCase()
    const operation = `getStockQuote(${t})`

    // Strategy 1: Internal realtime API with retry
    try {
      const response = await fetchWithRetry(
        `${getBaseUrl()}/api/quotes/realtime?symbols=${t}`,
        {},
        { timeoutMs: 15000, maxRetries: 2 }
      )

      const data = await response.json()
      if (data.quotes && data.quotes[t]) {
        return {
          success: true,
          source: 'realtime-api',
          data: data.quotes[t],
        }
      }
    } catch (err) {
      logger.error('Realtime quote API failed', { ticker: t, error: err instanceof Error ? err.message : 'Unknown' })
    }

    // Strategy 2: Try trending API (might have the stock)
    try {
      const response = await fetchWithRetry(
        `${getBaseUrl()}/api/trending`,
        {},
        { timeoutMs: 10000, maxRetries: 1 }
      )

      const data = await response.json()
      const allStocks = [...(data.gainers || []), ...(data.losers || []), ...(data.trending || [])]
      const match = allStocks.find((s: { symbol: string }) => s.symbol === t)

      if (match) {
        return {
          success: true,
          source: 'trending-api',
          data: match,
        }
      }
    } catch (err) {
      logger.error('Trending API fallback failed', { ticker: t, error: err instanceof Error ? err.message : 'Unknown' })
    }

    // Strategy 3: Supabase price snapshot
    try {
      const result = await withTimeout(
        getSupabase()
          .from('stock_prices_snapshot')
          .select('*')
          .eq('ticker', t)
          .single(),
        10000,
        'price_snapshot'
      ) as { data: Record<string, unknown> | null }

      if (result.data) {
        return {
          success: true,
          source: 'supabase-snapshot',
          data: result.data,
        }
      }
    } catch (err) {
      logger.error('Supabase snapshot fallback failed', { ticker: t, error: err instanceof Error ? err.message : 'Unknown' })
    }

    return createErrorResponse(
      new Error('Quote not available from any source'),
      { operation, ticker: t }
    )
  },
})

/**
 * Tool: Get Company Fundamentals
 * Fetches comprehensive fundamental data from Supabase, falls back to Financial Datasets API
 */
export const getCompanyFundamentalsTool = tool({
  description: 'Get company fundamentals including PE ratio, market cap, revenue, profit margins, debt ratios, and growth metrics',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    try {
      const t = ticker.toUpperCase()

      // First try financial_metrics table
      const { data: metrics } = await getSupabase()
        .from('financial_metrics')
        .select('*')
        .eq('ticker', t)
        .order('report_period', { ascending: false })
        .limit(1)
        .single()

      // Also fetch balance sheet for debt ratio calculations
      const { data: balanceSheet } = await getSupabase()
        .from('balance_sheets')
        .select('total_assets, total_liabilities, total_debt, shareholders_equity, current_assets, current_liabilities')
        .eq('ticker', t)
        .order('report_period', { ascending: false })
        .limit(1)
        .single()

      // Calculate debt ratios from balance sheet if not in financial_metrics
      let calculatedDebtToEquity: number | null = null
      let calculatedCurrentRatio: number | null = null

      if (balanceSheet) {
        const bs = balanceSheet as Record<string, number | null>
        const equity = bs.shareholders_equity || (bs.total_assets && bs.total_liabilities ? bs.total_assets - bs.total_liabilities : null)
        if (equity && equity > 0) {
          const debt = bs.total_debt || bs.total_liabilities
          if (debt) {
            calculatedDebtToEquity = Number((debt / equity).toFixed(2))
          }
        }
        if (bs.current_assets && bs.current_liabilities && bs.current_liabilities > 0) {
          calculatedCurrentRatio = Number((bs.current_assets / bs.current_liabilities).toFixed(2))
        }
      }

      if (metrics) {
        const m = metrics as Record<string, unknown>
        return {
          success: true,
          source: 'supabase',
          data: {
            ticker: t,
            pe_ratio: m.price_to_earnings_ratio,
            pb_ratio: m.price_to_book_ratio,
            ps_ratio: m.price_to_sales_ratio,
            ev_ebitda: m.enterprise_value_to_ebitda_ratio,
            debt_to_equity: m.debt_to_equity ?? calculatedDebtToEquity,
            current_ratio: m.current_ratio ?? calculatedCurrentRatio,
            gross_margin: m.gross_margin,
            operating_margin: m.operating_margin,
            net_margin: m.net_margin,
            roe: m.return_on_equity,
            roa: m.return_on_assets,
            roic: m.return_on_invested_capital,
            revenue_growth: m.revenue_growth,
            earnings_growth: m.earnings_growth,
            free_cash_flow_yield: m.free_cash_flow_yield,
            dividend_yield: m.dividend_yield,
            report_period: m.report_period,
            market_cap: m.market_cap,
            enterprise_value: m.enterprise_value,
            peg_ratio: m.peg_ratio,
            eps: m.earnings_per_share,
            total_debt: balanceSheet ? (balanceSheet as Record<string, unknown>).total_debt || (balanceSheet as Record<string, unknown>).total_liabilities : null,
            total_assets: balanceSheet ? (balanceSheet as Record<string, unknown>).total_assets : null,
          },
        }
      }

      // Fallback to company_fundamentals
      const { data: fundamentals } = await getSupabase()
        .from('company_fundamentals')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .single()

      if (fundamentals) {
        return { success: true, source: 'supabase', data: fundamentals }
      }

      // Fallback to Financial Datasets API
      if (hasFinancialAPI()) {
        const apiMetrics = await financialAPI.getFinancialMetricsSnapshot(ticker.toUpperCase())
        if (apiMetrics) {
          return {
            success: true,
            source: 'financialdatasets.ai',
            data: apiMetrics,
          }
        }
      }

      return { success: false, error: 'Fundamentals not found' }
    } catch (error) {
      if (hasFinancialAPI()) {
        const apiMetrics = await financialAPI.getFinancialMetricsSnapshot(ticker.toUpperCase())
        if (apiMetrics) {
          return { success: true, source: 'financialdatasets.ai', data: apiMetrics }
        }
      }
      return { success: false, error: 'Failed to fetch fundamentals' }
    }
  },
})

/**
 * Tool: Get Financial Statements
 */
export const getFinancialStatementsTool = tool({
  description: 'Get financial statements (income statement, balance sheet, or cash flow) for a company',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    statement_type: z.enum(['income', 'balance', 'cashflow']).describe('Type of financial statement'),
    period: z.enum(['annual', 'quarterly']).default('annual').describe('Annual or quarterly data'),
    limit: z.number().min(1).max(20).default(4).describe('Number of periods to return'),
  }),
  execute: async ({ ticker, statement_type, period, limit }) => {
    try {
      const tableMap = {
        income: 'income_statements',
        balance: 'balance_sheets',
        cashflow: 'cash_flow_statements',
      }

      const { data, error } = await getSupabase()
        .from(tableMap[statement_type])
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .eq('period', period)
        .order('report_period', { ascending: false })
        .limit(limit)

      if (!error && data && data.length > 0) {
        return {
          success: true,
          source: 'supabase',
          statement_type,
          period,
          data,
        }
      }

      // Fallback to Financial Datasets API
      if (hasFinancialAPI()) {
        let apiData: unknown[] = []
        if (statement_type === 'income') {
          apiData = await financialAPI.getIncomeStatements(ticker.toUpperCase(), period, limit)
        } else if (statement_type === 'balance') {
          apiData = await financialAPI.getBalanceSheets(ticker.toUpperCase(), period, limit)
        } else if (statement_type === 'cashflow') {
          apiData = await financialAPI.getCashFlowStatements(ticker.toUpperCase(), period, limit)
        }

        if (apiData.length > 0) {
          return {
            success: true,
            source: 'financialdatasets.ai',
            statement_type,
            period,
            data: apiData,
          }
        }
      }

      return {
        success: true,
        statement_type,
        period,
        data: data || [],
      }
    } catch (error) {
      if (hasFinancialAPI()) {
        let apiData: unknown[] = []
        if (statement_type === 'income') {
          apiData = await financialAPI.getIncomeStatements(ticker.toUpperCase(), period, limit)
        } else if (statement_type === 'balance') {
          apiData = await financialAPI.getBalanceSheets(ticker.toUpperCase(), period, limit)
        } else if (statement_type === 'cashflow') {
          apiData = await financialAPI.getCashFlowStatements(ticker.toUpperCase(), period, limit)
        }
        if (apiData.length > 0) {
          return { success: true, source: 'financialdatasets.ai', statement_type, period, data: apiData }
        }
      }
      return { success: false, error: 'Failed to fetch financial statements' }
    }
  },
})

/**
 * Tool: Get Insider Trading Activity
 */
export const getInsiderTradesTool = tool({
  description: 'Get insider trading activity (buys and sells by executives and directors) for a stock',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    days: z.number().min(7).max(365).default(90).describe('Number of days of history'),
  }),
  execute: async ({ ticker, days }) => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await getSupabase()
        .from('insider_trades')
        .select(`
          transaction_date,
          insider_name,
          title,
          transaction_type,
          shares,
          price_per_share,
          total_value,
          shares_owned_after
        `)
        .eq('ticker', ticker.toUpperCase())
        .gte('transaction_date', cutoffDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false })
        .limit(20)

      if (error) throw error

      type InsiderTrade = { transaction_type: string; total_value: number | null }
      const trades = (data || []) as InsiderTrade[]
      const buys = trades.filter(t => t.transaction_type === 'P' || t.transaction_type === 'Buy')
      const sells = trades.filter(t => t.transaction_type === 'S' || t.transaction_type === 'Sell')

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        period_days: days,
        summary: {
          total_buys: buys.length,
          total_sells: sells.length,
          buy_value: buys.reduce((sum, t) => sum + (t.total_value || 0), 0),
          sell_value: sells.reduce((sum, t) => sum + (t.total_value || 0), 0),
        },
        recent_transactions: (data as unknown[])?.slice(0, 10) || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch insider trades' }
    }
  },
})

/**
 * Tool: Get Institutional Ownership
 */
export const getInstitutionalOwnershipTool = tool({
  description: 'Get institutional ownership data (13F holdings) showing which hedge funds and institutions own a stock',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    try {
      const { data, error } = await getSupabase()
        .from('institutional_holdings')
        .select(`
          investor_name,
          investor_type,
          shares,
          value,
          percent_of_portfolio,
          change_shares,
          change_percent,
          filing_date
        `)
        .eq('ticker', ticker.toUpperCase())
        .order('value', { ascending: false })
        .limit(20)

      if (error) throw error

      type Holding = { shares: number | null; value: number | null }
      const holdings = (data || []) as Holding[]
      const totalShares = holdings.reduce((sum, h) => sum + (h.shares || 0), 0)
      const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0)

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        summary: {
          total_institutional_holders: holdings.length,
          total_shares_held: totalShares,
          total_value: totalValue,
        },
        top_holders: (data as unknown[])?.slice(0, 10) || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch institutional ownership' }
    }
  },
})

/**
 * Tool: Get Analyst Ratings
 */
export const getAnalystRatingsTool = tool({
  description: 'Get analyst ratings consensus, price targets, and recent rating changes for a stock',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    try {
      const { data: estimates, error } = await getSupabase()
        .from('analyst_estimates')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('period_end', { ascending: false })
        .limit(4)

      if (error) throw error

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        estimates: estimates || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch analyst data' }
    }
  },
})

/**
 * Tool: Get Short Interest Data
 */
export const getShortInterestTool = tool({
  description: 'Get short interest and short volume data showing how much of a stock is being shorted',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    days: z.number().min(7).max(90).default(30).describe('Number of days of history'),
  }),
  execute: async ({ ticker, days }) => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await getSupabase()
        .from('short_volume')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .gte('date', cutoffDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(days)

      if (error) throw error

      type ShortData = { short_percent: number | null }
      const shortData = (data || []) as ShortData[]
      const latestData = data?.[0]
      const avgShortPercent = shortData.reduce((sum, d) => sum + (d.short_percent || 0), 0) / (shortData.length || 1)

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        latest: latestData as unknown,
        average_short_percent: avgShortPercent,
        trend: (data as unknown[])?.slice(0, 10) || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch short interest' }
    }
  },
})

/**
 * Tool: Get Biotech Catalysts
 */
export const getBiotechCatalystsTool = tool({
  description: 'Get biotech catalysts including FDA approval dates, PDUFA dates, and clinical trial results for biotech stocks',
  inputSchema: z.object({
    ticker: z.string().optional().describe('Optional: specific biotech ticker'),
    days_ahead: z.number().min(1).max(365).default(90).describe('Number of days ahead to look for catalysts'),
  }),
  execute: async ({ ticker, days_ahead }) => {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days_ahead)

      let query = getSupabase()
        .from('biotech_catalysts')
        .select('*')
        .gte('expected_date', new Date().toISOString().split('T')[0])
        .lte('expected_date', futureDate.toISOString().split('T')[0])
        .order('expected_date', { ascending: true })
        .limit(20)

      if (ticker) {
        query = query.eq('ticker', ticker.toUpperCase())
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        ticker: ticker?.toUpperCase() || 'ALL',
        period_days: days_ahead,
        catalysts: data || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch biotech catalysts' }
    }
  },
})

/**
 * Tool: Search Stocks
 */
export const searchStocksTool = tool({
  description: 'Search for stocks by company name or ticker symbol. Finds peer companies and similar stocks.',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().min(1).max(20).default(10).describe('Number of results'),
  }),
  execute: async ({ query, limit }) => {
    const operation = `searchStocks(${query})`

    // Strategy 1: Try Supabase company_fundamentals
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await withTimeout(
          getSupabase()
            .from('company_fundamentals')
            .select('ticker, company_name, sector, industry, market_cap')
            .or(`ticker.ilike.%${query}%,company_name.ilike.%${query}%,industry.ilike.%${query}%,sector.ilike.%${query}%`)
            .order('market_cap', { ascending: false, nullsFirst: false })
            .limit(limit),
          15000,
          'Supabase search'
        )

        if (!error && data && data.length > 0) {
          return {
            success: true,
            query,
            source: 'supabase',
            results: data,
          }
        }

        if (error) {
          logger.error('Search attempt failed', { attempt: attempt + 1, error: error.message })
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
            continue
          }
        }
        break
      } catch (err) {
        logger.error('Search attempt error', { attempt: attempt + 1, error: err instanceof Error ? err.message : 'Unknown' })
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
        }
      }
    }

    // Strategy 2: Try internal search API
    try {
      const response = await fetchWithRetry(
        `${getBaseUrl()}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {},
        { timeoutMs: 10000, maxRetries: 2 }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          return {
            success: true,
            query,
            source: 'search-api',
            results: data.results.map((r: { symbol?: string; ticker?: string; name?: string; exchange?: string }) => ({
              ticker: r.symbol || r.ticker,
              company_name: r.name,
              exchange: r.exchange,
            })),
          }
        }
      }
    } catch (err) {
      logger.error('Search API fallback failed', { error: err instanceof Error ? err.message : 'Unknown' })
    }

    // Strategy 3: Try financial_metrics table
    try {
      const result = await withTimeout(
        getSupabase()
          .from('financial_metrics')
          .select('ticker')
          .ilike('ticker', `%${query}%`)
          .limit(limit),
        10000,
        'financial_metrics search'
      ) as { data: { ticker: string }[] | null }

      if (result.data && result.data.length > 0) {
        return {
          success: true,
          query,
          source: 'financial_metrics',
          results: result.data.map(d => ({ ticker: d.ticker })),
          note: 'Limited results - only tickers found',
        }
      }
    } catch (err) {
      logger.error('financial_metrics fallback failed', { error: err instanceof Error ? err.message : 'Unknown' })
    }

    return createErrorResponse(
      new Error('All search strategies exhausted'),
      { operation, ticker: query }
    )
  },
})

/**
 * Tool: Get Market Movers
 */
export const getMarketMoversTool = tool({
  description: 'Get market movers - top gainers, top losers, or most active stocks',
  inputSchema: z.object({
    type: z.enum(['gainers', 'losers', 'active']).describe('Type of market movers'),
    limit: z.number().min(5).max(20).default(10).describe('Number of stocks to return'),
  }),
  execute: async ({ type, limit }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/markets/${type === 'active' ? 'most-active' : `top-${type}`}`)
      const data = await response.json()

      return {
        success: true,
        type,
        stocks: Array.isArray(data) ? data.slice(0, limit) : [],
      }
    } catch (error) {
      return { success: false, error: `Failed to fetch ${type}` }
    }
  },
})

/**
 * Tool: Compare Stocks
 */
export const compareStocksTool = tool({
  description: 'Compare key financial metrics between two stocks side by side',
  inputSchema: z.object({
    ticker1: z.string().describe('First stock ticker'),
    ticker2: z.string().describe('Second stock ticker'),
  }),
  execute: async ({ ticker1, ticker2 }) => {
    const t1 = ticker1.toUpperCase()
    const t2 = ticker2.toUpperCase()
    const operation = `compareStocks(${t1}, ${t2})`

    const fetchStockData = async (ticker: string) => {
      // Strategy 1: Try financial_metrics
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error } = await withTimeout(
            getSupabase()
              .from('financial_metrics')
              .select('*')
              .eq('ticker', ticker)
              .order('report_period', { ascending: false })
              .limit(1)
              .single(),
            15000,
            `financial_metrics(${ticker})`
          )

          if (!error && data) return { source: 'financial_metrics', data }
        } catch (err) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 1000))
        }
      }

      // Strategy 2: Try company_fundamentals
      try {
        const { data } = await withTimeout(
          getSupabase()
            .from('company_fundamentals')
            .select('*')
            .eq('ticker', ticker)
            .single(),
          10000,
          `company_fundamentals(${ticker})`
        )

        if (data) return { source: 'company_fundamentals', data }
      } catch (err) {
        logger.error('company_fundamentals fallback failed', { ticker, error: err instanceof Error ? err.message : 'Unknown' })
      }

      // Strategy 3: Try Financial Datasets API
      if (hasFinancialAPI()) {
        try {
          const apiData = await withTimeout(
            financialAPI.getFinancialMetricsSnapshot(ticker),
            15000,
            `FinancialAPI(${ticker})`
          )

          if (apiData) {
            return { source: 'financial_datasets_api', data: apiData }
          }
        } catch (err) {
          logger.error('Financial Datasets API fallback failed', { ticker, error: err instanceof Error ? err.message : 'Unknown' })
        }
      }

      return { source: 'none', data: null, error: `No data found for ${ticker}` }
    }

    try {
      const [stock1, stock2] = await Promise.all([
        fetchStockData(t1),
        fetchStockData(t2),
      ])

      const hasData1 = stock1.data !== null
      const hasData2 = stock2.data !== null

      if (!hasData1 && !hasData2) {
        return createErrorResponse(
          new Error(`No data found for either ${t1} or ${t2}`),
          { operation }
        )
      }

      return {
        success: true,
        comparison: {
          [t1]: {
            found: hasData1,
            source: stock1.source,
            data: stock1.data || {},
          },
          [t2]: {
            found: hasData2,
            source: stock2.source,
            data: stock2.data || {},
          },
        },
        note: !hasData1 || !hasData2
          ? `Partial data: ${!hasData1 ? t1 : t2} not found`
          : undefined,
      }
    } catch (error) {
      return createErrorResponse(error, { operation })
    }
  },
})
