/**
 * External API tools (Financial Datasets API)
 * SEC filings, price history, news, segments, estimates
 */

import { tool } from 'ai'
import { z } from 'zod'
import * as financialAPI from '../financial-datasets-api'
import { getSupabase, hasFinancialAPI } from './utils'

/**
 * Tool: Get SEC Filings
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
          prices: prices.slice(0, 10),
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
