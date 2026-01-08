import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import Firecrawl from '@mendable/firecrawl-js'

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

/**
 * Tool: Get Stock Quote
 * Fetches real-time stock price and basic info
 */
export const getStockQuoteTool = tool({
  description: 'Get real-time stock quote with price, change, volume, and market cap for a given ticker symbol',
  parameters: z.object({
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
 * Fetches comprehensive fundamental data from Supabase
 */
export const getCompanyFundamentalsTool = tool({
  description: 'Get company fundamentals including PE ratio, market cap, revenue, profit margins, debt ratios, and growth metrics',
  parameters: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    try {
      // First try financial_metrics table
      const { data: metrics, error: metricsError } = await getSupabase()
        .from('financial_metrics')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('report_period', { ascending: false })
        .limit(1)
        .single()

      if (metrics) {
        return {
          success: true,
          data: {
            ticker: ticker.toUpperCase(),
            pe_ratio: metrics.pe_ratio,
            pb_ratio: metrics.pb_ratio,
            ps_ratio: metrics.ps_ratio,
            ev_ebitda: metrics.ev_to_ebitda,
            debt_to_equity: metrics.debt_to_equity,
            current_ratio: metrics.current_ratio,
            gross_margin: metrics.gross_margin,
            operating_margin: metrics.operating_margin,
            net_margin: metrics.net_margin,
            roe: metrics.return_on_equity,
            roa: metrics.return_on_assets,
            roic: metrics.return_on_invested_capital,
            revenue_growth: metrics.revenue_growth,
            earnings_growth: metrics.earnings_growth,
            free_cash_flow_yield: metrics.free_cash_flow_yield,
            dividend_yield: metrics.dividend_yield,
            report_period: metrics.report_period,
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
        return { success: true, data: fundamentals }
      }

      return { success: false, error: 'Fundamentals not found' }
    } catch (error) {
      return { success: false, error: 'Failed to fetch fundamentals' }
    }
  },
})

/**
 * Tool: Get Financial Statements
 * Fetches income statement, balance sheet, or cash flow data
 */
export const getFinancialStatementsTool = tool({
  description: 'Get financial statements (income statement, balance sheet, or cash flow) for a company',
  parameters: z.object({
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
        .eq('period_type', period)
        .order('report_period', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        statement_type,
        period,
        data: data || [],
      }
    } catch (error) {
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
  parameters: z.object({
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
      const buys = data?.filter(t => t.transaction_type === 'P' || t.transaction_type === 'Buy') || []
      const sells = data?.filter(t => t.transaction_type === 'S' || t.transaction_type === 'Sell') || []

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
        recent_transactions: data?.slice(0, 10) || [],
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
  parameters: z.object({
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

      const totalShares = data?.reduce((sum, h) => sum + (h.shares || 0), 0) || 0
      const totalValue = data?.reduce((sum, h) => sum + (h.value || 0), 0) || 0

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        summary: {
          total_institutional_holders: data?.length || 0,
          total_shares_held: totalShares,
          total_value: totalValue,
        },
        top_holders: data?.slice(0, 10) || [],
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
  parameters: z.object({
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
  parameters: z.object({
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

      const latestData = data?.[0]
      const avgShortPercent = data?.reduce((sum, d) => sum + (d.short_percent || 0), 0) / (data?.length || 1)

      return {
        success: true,
        ticker: ticker.toUpperCase(),
        latest: latestData,
        average_short_percent: avgShortPercent,
        trend: data?.slice(0, 10) || [],
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
  parameters: z.object({
    ticker: z.string().optional().describe('Optional: specific biotech ticker. If not provided, returns upcoming catalysts for all biotech stocks'),
    days_ahead: z.number().min(1).max(365).default(90).describe('Number of days ahead to look for catalysts'),
  }),
  execute: async ({ ticker, days_ahead }) => {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days_ahead)

      let query = supabase
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
  parameters: z.object({
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
  parameters: z.object({
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
  parameters: z.object({
    ticker1: z.string().describe('First stock ticker'),
    ticker2: z.string().describe('Second stock ticker'),
  }),
  execute: async ({ ticker1, ticker2 }) => {
    try {
      // Fetch fundamentals for both
      const [result1, result2] = await Promise.all([
        supabase
          .from('financial_metrics')
          .select('*')
          .eq('ticker', ticker1.toUpperCase())
          .order('report_period', { ascending: false })
          .limit(1)
          .single(),
        supabase
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
  parameters: z.object({
    url: z.string().url().describe('URL to scrape (e.g., news article, SEC filing, company page)'),
  }),
  execute: async ({ url }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const firecrawl = new Firecrawl({ apiKey })
      const result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
      })

      if (result.success && result.markdown) {
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
  parameters: z.object({
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
      const results = await firecrawl.search(query, { limit })

      if (results && results.length > 0) {
        return {
          success: true,
          query,
          results: results.map((r: { url: string; markdown?: string; metadata?: { title?: string } }) => ({
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
 * All tools exported as an object for use in the chat API
 */
export const financialTools = {
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
  scrapeWebContent: scrapeWebContentTool,
  searchFinancialNews: searchFinancialNewsTool,
}
