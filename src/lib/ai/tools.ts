import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import Firecrawl from '@mendable/firecrawl-js'
import * as financialAPI from './financial-datasets-api'

// Lazy-load Supabase client to avoid build-time errors
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseClient
}

// Base URL for internal API calls
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  return 'http://localhost:3000'
}

// Check if Financial Datasets API is configured
const hasFinancialAPI = () => !!process.env.FINANCIAL_DATASETS_API_KEY

/**
 * Tool: Get Stock Quote
 * Fetches real-time stock price and basic info
 */
export const getStockQuoteTool = tool({
  description: 'Get real-time stock quote with price, change, volume, and market cap for a given ticker symbol',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol (e.g., AAPL, MSFT, TSLA)'),
  }),
  execute: async ({ ticker }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/quotes/realtime?symbols=${ticker.toUpperCase()}`)
      const data = await response.json()

      if (data.quotes && data.quotes[ticker.toUpperCase()]) {
        return {
          success: true,
          data: data.quotes[ticker.toUpperCase()],
        }
      }
      return { success: false, error: 'Quote not found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch quote' }
    }
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
      // First try financial_metrics table
      const { data: metrics } = await getSupabase()
        .from('financial_metrics')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('report_period', { ascending: false })
        .limit(1)
        .single()

      if (metrics) {
        const m = metrics as Record<string, unknown>
        return {
          success: true,
          source: 'supabase',
          data: {
            ticker: ticker.toUpperCase(),
            pe_ratio: m.pe_ratio,
            pb_ratio: m.pb_ratio,
            ps_ratio: m.ps_ratio,
            ev_ebitda: m.ev_to_ebitda,
            debt_to_equity: m.debt_to_equity,
            current_ratio: m.current_ratio,
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
      // Last resort: try API
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
 * Fetches income statement, balance sheet, or cash flow data with API fallback
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
      // Try API on error
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
 * Fetches recent insider buys and sells
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

      // Summarize the data
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
 * Fetches 13F institutional holdings data
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
 * Fetches analyst ratings and price targets
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
 * Fetches short volume and short interest data
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
 * Fetches upcoming FDA dates and clinical trial events
 */
export const getBiotechCatalystsTool = tool({
  description: 'Get biotech catalysts including FDA approval dates, PDUFA dates, and clinical trial results for biotech stocks',
  inputSchema: z.object({
    ticker: z.string().optional().describe('Optional: specific biotech ticker. If not provided, returns upcoming catalysts for all biotech stocks'),
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
 * Searches for stocks by name or ticker
 */
export const searchStocksTool = tool({
  description: 'Search for stocks by company name or ticker symbol',
  inputSchema: z.object({
    query: z.string().describe('Search query (company name or ticker)'),
    limit: z.number().min(1).max(20).default(10).describe('Number of results'),
  }),
  execute: async ({ query, limit }) => {
    try {
      const { data, error } = await getSupabase()
        .from('company_fundamentals')
        .select('ticker, company_name, sector, industry, market_cap')
        .or(`ticker.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order('market_cap', { ascending: false, nullsFirst: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        query,
        results: data || [],
      }
    } catch (error) {
      return { success: false, error: 'Failed to search stocks' }
    }
  },
})

/**
 * Tool: Get Market Movers
 * Fetches top gainers, losers, or most active stocks
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
 * Compares key metrics between two stocks
 */
export const compareStocksTool = tool({
  description: 'Compare key financial metrics between two stocks side by side',
  inputSchema: z.object({
    ticker1: z.string().describe('First stock ticker'),
    ticker2: z.string().describe('Second stock ticker'),
  }),
  execute: async ({ ticker1, ticker2 }) => {
    try {
      // Fetch fundamentals for both
      const [result1, result2] = await Promise.all([
        getSupabase()
          .from('financial_metrics')
          .select('*')
          .eq('ticker', ticker1.toUpperCase())
          .order('report_period', { ascending: false })
          .limit(1)
          .single(),
        getSupabase()
          .from('financial_metrics')
          .select('*')
          .eq('ticker', ticker2.toUpperCase())
          .order('report_period', { ascending: false })
          .limit(1)
          .single(),
      ])

      return {
        success: true,
        comparison: {
          [ticker1.toUpperCase()]: result1.data || {},
          [ticker2.toUpperCase()]: result2.data || {},
        },
      }
    } catch (error) {
      return { success: false, error: 'Failed to compare stocks' }
    }
  },
})

/**
 * Tool: Scrape Financial News/Research
 * Uses Firecrawl to scrape web content
 */
export const scrapeWebContentTool = tool({
  description: 'Scrape financial news articles, research reports, or company information from a URL. Use this to get latest news or research about a stock.',
  inputSchema: z.object({
    url: z.string().url().describe('URL to scrape (e.g., news article, SEC filing, company page)'),
  }),
  execute: async ({ url }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const firecrawl = new Firecrawl({ apiKey })
      const result = await firecrawl.scrape(url, {
        formats: ['markdown'],
      }) as { markdown?: string; metadata?: { title?: string } }

      if (result.markdown) {
        // Truncate content to avoid token limits
        const content = result.markdown.substring(0, 4000)
        return {
          success: true,
          url,
          title: result.metadata?.title || 'Unknown',
          content,
        }
      }

      return { success: false, error: 'Failed to scrape URL' }
    } catch (error) {
      return { success: false, error: 'Scraping failed' }
    }
  },
})

/**
 * Tool: Search Financial News
 * Uses Firecrawl to search the web for financial news
 */
export const searchFinancialNewsTool = tool({
  description: 'Search the web for recent financial news about a stock, company, or market topic',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "AAPL earnings report", "Tesla delivery numbers")'),
    limit: z.number().min(1).max(5).default(3).describe('Number of results'),
  }),
  execute: async ({ query, limit }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const firecrawl = new Firecrawl({ apiKey })
      type SearchResult = { url: string; markdown?: string; metadata?: { title?: string } }
      const searchResponse = await firecrawl.search(query, { limit }) as { data?: SearchResult[] }
      const results = searchResponse.data || []

      if (results.length > 0) {
        return {
          success: true,
          query,
          results: results.map((r) => ({
            url: r.url,
            title: r.metadata?.title || 'Unknown',
            snippet: r.markdown?.substring(0, 500) || '',
          })),
        }
      }

      return { success: false, error: 'No results found' }
    } catch (error) {
      return { success: false, error: 'Search failed' }
    }
  },
})

/**
 * Tool: Get SEC Filings
 * Fetches 10K, 10Q, 8K and other SEC filings
 */
export const getSECFilingsTool = tool({
  description: 'Get SEC filings (10K annual reports, 10Q quarterly reports, 8K current reports) for a company',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    form_type: z.enum(['10-K', '10-Q', '8-K', 'all']).default('all').describe('Type of SEC filing'),
    limit: z.number().min(1).max(20).default(10).describe('Number of filings to return'),
  }),
  execute: async ({ ticker, form_type, limit }) => {
    try {
      if (!hasFinancialAPI()) {
        return { success: false, error: 'Financial Datasets API key not configured' }
      }

      const formTypeFilter = form_type === 'all' ? undefined : form_type
      const filings = await financialAPI.getFilings(ticker.toUpperCase(), formTypeFilter, limit)

      if (filings.length > 0) {
        return {
          success: true,
          ticker: ticker.toUpperCase(),
          form_type,
          filings: filings.map(f => ({
            form_type: f.form_type,
            filed_date: f.filed_date,
            period_of_report: f.period_of_report,
            url: f.url,
          })),
        }
      }

      return { success: false, error: 'No filings found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch SEC filings' }
    }
  },
})

/**
 * Tool: Get Price History
 * Fetches historical stock prices
 */
export const getPriceHistoryTool = tool({
  description: 'Get historical stock price data including open, high, low, close, and volume',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    days: z.number().min(1).max(365).default(30).describe('Number of days of price history'),
  }),
  execute: async ({ ticker, days }) => {
    try {
      if (!hasFinancialAPI()) {
        return { success: false, error: 'Financial Datasets API key not configured' }
      }

      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const prices = await financialAPI.getPrices(ticker.toUpperCase(), startDate, endDate, days)

      if (prices.length > 0) {
        const latest = prices[0]
        const oldest = prices[prices.length - 1]
        const priceChange = latest.close - oldest.close
        const percentChange = (priceChange / oldest.close) * 100

        return {
          success: true,
          ticker: ticker.toUpperCase(),
          period_days: days,
          summary: {
            current_price: latest.close,
            period_high: Math.max(...prices.map(p => p.high)),
            period_low: Math.min(...prices.map(p => p.low)),
            price_change: priceChange,
            percent_change: percentChange,
            avg_volume: prices.reduce((sum, p) => sum + p.volume, 0) / prices.length,
          },
          prices: prices.slice(0, 10), // Return last 10 days
        }
      }

      return { success: false, error: 'No price data found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch price history' }
    }
  },
})

/**
 * Tool: Get Financial News
 * Fetches news from Financial Datasets API
 */
export const getFinancialNewsTool = tool({
  description: 'Get recent financial news articles about a stock from professional news sources',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    limit: z.number().min(1).max(20).default(5).describe('Number of news articles'),
  }),
  execute: async ({ ticker, limit }) => {
    try {
      if (!hasFinancialAPI()) {
        return { success: false, error: 'Financial Datasets API key not configured' }
      }

      const news = await financialAPI.getNews(ticker.toUpperCase(), limit)

      if (news.length > 0) {
        return {
          success: true,
          ticker: ticker.toUpperCase(),
          articles: news.map(n => ({
            title: n.title,
            source: n.source,
            published_at: n.published_at,
            sentiment: n.sentiment,
            summary: n.summary,
            url: n.url,
          })),
        }
      }

      return { success: false, error: 'No news found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch news' }
    }
  },
})

/**
 * Tool: Get Segmented Revenue
 * Fetches revenue breakdown by business segment
 */
export const getSegmentedRevenueTool = tool({
  description: 'Get revenue breakdown by business segment or geography for a company',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    period: z.enum(['annual', 'quarterly']).default('annual').describe('Annual or quarterly data'),
    limit: z.number().min(1).max(10).default(4).describe('Number of periods'),
  }),
  execute: async ({ ticker, period, limit }) => {
    try {
      if (!hasFinancialAPI()) {
        return { success: false, error: 'Financial Datasets API key not configured' }
      }

      const segments = await financialAPI.getSegmentedRevenues(ticker.toUpperCase(), period, limit)

      if (segments.length > 0) {
        // Group by report period
        const byPeriod: Record<string, typeof segments> = {}
        segments.forEach(s => {
          if (!byPeriod[s.report_period]) byPeriod[s.report_period] = []
          byPeriod[s.report_period].push(s)
        })

        return {
          success: true,
          ticker: ticker.toUpperCase(),
          period,
          segments_by_period: byPeriod,
        }
      }

      return { success: false, error: 'No segment data found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch segmented revenue' }
    }
  },
})

/**
 * Tool: Get Analyst Estimates
 * Fetches detailed analyst estimates and forecasts
 */
export const getAnalystEstimatesTool = tool({
  description: 'Get detailed analyst estimates including EPS, revenue forecasts, and price targets',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    try {
      // First try Supabase
      const { data: estimates } = await getSupabase()
        .from('analyst_estimates')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('period_end', { ascending: false })
        .limit(8)

      if (estimates && estimates.length > 0) {
        return {
          success: true,
          source: 'supabase',
          ticker: ticker.toUpperCase(),
          estimates,
        }
      }

      // Fallback to API
      if (hasFinancialAPI()) {
        const apiEstimates = await financialAPI.getAnalystEstimates(ticker.toUpperCase())
        if (apiEstimates.length > 0) {
          return {
            success: true,
            source: 'financialdatasets.ai',
            ticker: ticker.toUpperCase(),
            estimates: apiEstimates,
          }
        }
      }

      return { success: false, error: 'No analyst estimates found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch analyst estimates' }
    }
  },
})

// ============================================
// ADVANCED FIRECRAWL TOOLS
// ============================================

/**
 * Tool: Deep Research
 * Uses Firecrawl's Deep Research API for comprehensive autonomous research
 */
export const deepResearchTool = tool({
  description: 'Perform comprehensive autonomous deep research on any financial topic. The AI will search multiple sources, analyze content, and synthesize findings. Best for complex questions requiring multi-source research.',
  inputSchema: z.object({
    query: z.string().describe('Research query (e.g., "Apple Q4 2024 earnings analysis and outlook")'),
    maxDepth: z.number().min(1).max(10).default(5).describe('Research depth - higher means more thorough'),
    maxUrls: z.number().min(1).max(50).default(15).describe('Maximum URLs to analyze'),
    timeLimit: z.number().min(30).max(300).default(120).describe('Time limit in seconds'),
  }),
  execute: async ({ query, maxDepth, maxUrls, timeLimit }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const response = await fetch('https://api.firecrawl.dev/v1/deep-research', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          maxDepth,
          maxUrls,
          timeLimit,
        }),
      })

      if (!response.ok) {
        return { success: false, error: `Deep research failed: ${response.status}` }
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          success: true,
          query,
          finalAnalysis: result.data.finalAnalysis,
          sources: result.data.sources?.slice(0, 10) || [],
          activitiesCount: result.data.activities?.length || 0,
        }
      }

      return { success: false, error: 'Deep research returned no results' }
    } catch (error) {
      return { success: false, error: 'Deep research failed' }
    }
  },
})

/**
 * Tool: Extract Structured Financial Data
 * Uses Firecrawl's Extract API with schemas for structured data extraction
 */
export const extractFinancialDataTool = tool({
  description: 'Extract structured financial data from investor relations pages or financial websites using AI. Specify what data you need and from which URLs.',
  inputSchema: z.object({
    urls: z.array(z.string()).min(1).max(5).describe('URLs to extract from (e.g., ["https://investor.apple.com"])'),
    prompt: z.string().describe('What data to extract (e.g., "Extract revenue, net income, and EPS for the latest quarter")'),
    dataType: z.enum(['earnings', 'guidance', 'metrics', 'custom']).default('custom').describe('Type of financial data to extract'),
  }),
  execute: async ({ urls, prompt, dataType }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      // Define schemas based on data type
      const schemas: Record<string, object> = {
        earnings: {
          type: 'object',
          properties: {
            revenue: { type: 'string' },
            net_income: { type: 'string' },
            eps: { type: 'string' },
            eps_estimate: { type: 'string' },
            quarter: { type: 'string' },
            year_over_year_growth: { type: 'string' },
          },
        },
        guidance: {
          type: 'object',
          properties: {
            revenue_guidance: { type: 'string' },
            eps_guidance: { type: 'string' },
            guidance_period: { type: 'string' },
            key_factors: { type: 'array', items: { type: 'string' } },
          },
        },
        metrics: {
          type: 'object',
          properties: {
            gross_margin: { type: 'string' },
            operating_margin: { type: 'string' },
            free_cash_flow: { type: 'string' },
            debt_to_equity: { type: 'string' },
            return_on_equity: { type: 'string' },
          },
        },
        custom: {
          type: 'object',
          additionalProperties: true,
        },
      }

      const response = await fetch('https://api.firecrawl.dev/v1/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          prompt,
          schema: schemas[dataType],
        }),
      })

      if (!response.ok) {
        return { success: false, error: `Extract failed: ${response.status}` }
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          success: true,
          urls,
          dataType,
          extractedData: result.data,
        }
      }

      return { success: false, error: 'No data extracted' }
    } catch (error) {
      return { success: false, error: 'Extraction failed' }
    }
  },
})

/**
 * Tool: Search Financial News (Enhanced)
 * Uses Firecrawl search with news source and time filtering
 */
export const searchRecentNewsTool = tool({
  description: 'Search for recent financial news with time filtering. Better than basic search for finding latest news and earnings coverage.',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "AAPL earnings Q4 2024")'),
    timeRange: z.enum(['day', 'week', 'month', 'year']).default('week').describe('How recent the news should be'),
    limit: z.number().min(1).max(10).default(5).describe('Number of results'),
    newsOnly: z.boolean().default(true).describe('Only return news articles'),
  }),
  execute: async ({ query, timeRange, limit, newsOnly }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      // Time filter mapping
      const timeFilters: Record<string, string> = {
        day: 'qdr:d',
        week: 'qdr:w',
        month: 'qdr:m',
        year: 'qdr:y',
      }

      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          sources: newsOnly ? ['news'] : ['web'],
          tbs: timeFilters[timeRange],
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true,
          },
        }),
      })

      if (!response.ok) {
        return { success: false, error: `News search failed: ${response.status}` }
      }

      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        return {
          success: true,
          query,
          timeRange,
          results: result.data.map((r: { url: string; title?: string; markdown?: string; publishedDate?: string }) => ({
            url: r.url,
            title: r.title || 'Unknown',
            snippet: r.markdown?.substring(0, 600) || '',
            publishedDate: r.publishedDate,
          })),
        }
      }

      return { success: false, error: 'No news found' }
    } catch (error) {
      return { success: false, error: 'News search failed' }
    }
  },
})

/**
 * Tool: Firecrawl Agent
 * Autonomous AI agent that finds data without needing specific URLs
 */
export const firecrawlAgentTool = tool({
  description: 'Use an AI agent to autonomously search the web and find specific financial data. Best when you don\'t know which websites to look at.',
  inputSchema: z.object({
    prompt: z.string().describe('What data to find (e.g., "Find Tesla\'s latest delivery numbers and production figures")'),
    focusUrls: z.array(z.string()).optional().describe('Optional URLs to focus the search on'),
  }),
  execute: async ({ prompt, focusUrls }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const response = await fetch('https://api.firecrawl.dev/v1/agent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          urls: focusUrls,
        }),
      })

      if (!response.ok) {
        return { success: false, error: `Agent failed: ${response.status}` }
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          success: true,
          prompt,
          data: result.data,
          sources: result.sources || [],
        }
      }

      return { success: false, error: 'Agent returned no results' }
    } catch (error) {
      return { success: false, error: 'Agent search failed' }
    }
  },
})

/**
 * Tool: Crawl Investor Relations
 * Crawl entire investor relations pages for comprehensive data
 */
export const crawlInvestorRelationsTool = tool({
  description: 'Crawl an entire investor relations website to gather comprehensive financial information. Use for deep company research.',
  inputSchema: z.object({
    url: z.string().url().describe('Investor relations page URL (e.g., "https://investor.apple.com")'),
    maxPages: z.number().min(1).max(20).default(10).describe('Maximum pages to crawl'),
  }),
  execute: async ({ url, maxPages }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const firecrawl = new Firecrawl({ apiKey })

      // Start crawl
      const crawlResult = await firecrawl.crawl(url, {
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }) as { success?: boolean; data?: Array<{ url: string; markdown?: string; metadata?: { title?: string } }> }

      if (crawlResult.success && crawlResult.data && crawlResult.data.length > 0) {
        // Summarize findings
        const pages = crawlResult.data.map(page => ({
          url: page.url,
          title: page.metadata?.title || 'Unknown',
          contentPreview: page.markdown?.substring(0, 500) || '',
        }))

        return {
          success: true,
          baseUrl: url,
          pagesFound: pages.length,
          pages,
        }
      }

      return { success: false, error: 'Crawl returned no results' }
    } catch (error) {
      return { success: false, error: 'Crawl failed' }
    }
  },
})

/**
 * All tools exported as an object for use in the chat API
 */
export const financialTools = {
  // Core financial data from Supabase
  getStockQuote: getStockQuoteTool,
  getCompanyFundamentals: getCompanyFundamentalsTool,
  getFinancialStatements: getFinancialStatementsTool,
  getInsiderTrades: getInsiderTradesTool,
  getInstitutionalOwnership: getInstitutionalOwnershipTool,
  getAnalystRatings: getAnalystRatingsTool,
  getShortInterest: getShortInterestTool,
  getBiotechCatalysts: getBiotechCatalystsTool,
  searchStocks: searchStocksTool,
  getMarketMovers: getMarketMoversTool,
  compareStocks: compareStocksTool,

  // Basic Firecrawl tools
  scrapeWebContent: scrapeWebContentTool,
  searchFinancialNews: searchFinancialNewsTool,

  // Financial Datasets API tools
  getSECFilings: getSECFilingsTool,
  getPriceHistory: getPriceHistoryTool,
  getFinancialNews: getFinancialNewsTool,
  getSegmentedRevenue: getSegmentedRevenueTool,
  getAnalystEstimates: getAnalystEstimatesTool,

  // Advanced Firecrawl tools
  deepResearch: deepResearchTool,
  extractFinancialData: extractFinancialDataTool,
  searchRecentNews: searchRecentNewsTool,
  firecrawlAgent: firecrawlAgentTool,
  crawlInvestorRelations: crawlInvestorRelationsTool,
}
