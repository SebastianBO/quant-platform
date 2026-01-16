/**
 * RAG (Retrieval-Augmented Generation) tools
 * Semantic search on financial documents using pgvector
 */

import { logger } from '@/lib/logger'
import { tool, embed } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { getSupabase } from './utils'

/**
 * Tool: Search Financial Documents (RAG)
 */
export const searchFinancialDocumentsTool = tool({
  description: 'Search financial documents using semantic similarity (RAG). Use for questions about what a company said in earnings calls, SEC filings, or recent announcements.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    ticker: z.string().optional().describe('Filter by ticker symbol'),
    documentType: z.enum(['sec_filing', 'earnings_transcript', 'news', 'research', 'company_overview']).optional().describe('Filter by document type'),
    limit: z.number().optional().default(5).describe('Maximum results to return'),
  }),
  execute: async ({ query, ticker, documentType, limit }) => {
    try {
      // Generate embedding using AI SDK with text-embedding-3-small
      const { embedding: queryEmbedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: query,
      })

      // Search using Supabase RPC function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (getSupabase().rpc as any)('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit || 5,
        filter_ticker: ticker?.toUpperCase() || null,
        filter_doc_type: documentType || null,
      })

      if (error) {
        logger.error('RAG search error', { error: error.message })
        return { success: false, error: 'Document search failed' }
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          source: 'supabase-rag',
          message: 'No matching documents found',
          results: [],
        }
      }

      return {
        success: true,
        source: 'supabase-rag',
        results: data.map((doc: { id: string; ticker: string; document_type: string; title: string; content: string; source_url: string; document_date: string; similarity: number }) => ({
          ticker: doc.ticker,
          type: doc.document_type,
          title: doc.title,
          excerpt: doc.content?.substring(0, 500) + '...',
          sourceUrl: doc.source_url,
          date: doc.document_date,
          relevanceScore: doc.similarity,
        })),
        count: data.length,
      }
    } catch (error) {
      logger.error('RAG search error', { error: error instanceof Error ? error.message : 'Unknown' })
      return { success: false, error: 'Document search failed' }
    }
  },
})

/**
 * Tool: Search Similar Earnings Patterns
 * NOTE: Currently disabled - redirects to document search
 */
export const searchEarningsPatternsTool = tool({
  description: 'Find companies with similar earnings surprise patterns. NOTE: Currently redirects to document search.',
  inputSchema: z.object({
    ticker: z.string().describe('Reference ticker to find similar patterns for'),
    surpriseBucket: z.enum(['massive_beat', 'beat', 'inline', 'miss', 'massive_miss']).optional().describe('Filter by surprise type'),
    limit: z.number().optional().default(10).describe('Maximum results to return'),
  }),
  execute: async ({ ticker }) => {
    return {
      success: false,
      error: 'Earnings pattern search is currently being upgraded',
      suggestion: `Use searchFinancialDocuments with query "earnings ${ticker}" and documentType="earnings_transcript" instead`,
      ticker: ticker.toUpperCase(),
    }
  },
})

/**
 * Tool: Get Semantic Context for Query
 */
export const getSemanticContextTool = tool({
  description: 'Get relevant context from financial documents to augment AI responses.',
  inputSchema: z.object({
    query: z.string().describe('The question or topic to find context for'),
    tickers: z.array(z.string()).optional().describe('List of tickers to search'),
    topK: z.number().optional().default(3).describe('Number of context chunks per source'),
  }),
  execute: async ({ query, tickers, topK }) => {
    try {
      // Generate embedding using AI SDK with text-embedding-3-small
      const { embedding: queryEmbedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: query,
      })

      // Search across document types
      const contexts: { type: string; ticker: string; content: string; score: number }[] = []

      for (const docType of ['sec_filing', 'earnings_transcript', 'news']) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (getSupabase().rpc as any)('match_documents', {
          query_embedding: queryEmbedding,
          match_threshold: 0.65,
          match_count: topK || 3,
          filter_ticker: tickers?.[0]?.toUpperCase() || null,
          filter_doc_type: docType,
        })

        if (data) {
          for (const doc of data) {
            contexts.push({
              type: doc.document_type,
              ticker: doc.ticker,
              content: doc.content?.substring(0, 800),
              score: doc.similarity,
            })
          }
        }
      }

      // Sort by relevance score
      contexts.sort((a, b) => b.score - a.score)

      return {
        success: true,
        source: 'supabase-rag',
        contexts: contexts.slice(0, (topK || 3) * 3),
        totalFound: contexts.length,
        query,
      }
    } catch (error) {
      return { success: false, error: 'Context retrieval failed' }
    }
  },
})

/**
 * Earnings Calendar Tool
 */
export const getEarningsCalendarTool = tool({
  description: 'Get upcoming earnings calendar and recent earnings results.',
  inputSchema: z.object({
    tickers: z.array(z.string()).optional().describe('Optional list of tickers to filter'),
    days: z.number().min(1).max(90).default(14).describe('Number of days forward/backward to search'),
    direction: z.enum(['upcoming', 'recent', 'both']).default('upcoming').describe('Get upcoming, recent, or both'),
    limit: z.number().min(1).max(100).default(20).describe('Maximum results to return'),
  }),
  execute: async ({ tickers, days = 14, direction = 'upcoming', limit = 20 }) => {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: 'Database not configured' }

    interface UpcomingEarning {
      symbol: string
      company_name: string | null
      report_date: string
      report_time: string | null
      eps_estimate: number | null
      revenue_estimate: number | null
      fiscal_quarter: number | null
      fiscal_year: number | null
    }

    interface RecentEarning {
      symbol: string
      company_name: string | null
      report_date: string
      eps_actual: number | null
      eps_estimate: number | null
      eps_surprise: number | null
      eps_surprise_percent: number | null
      revenue_actual: number | null
    }

    try {
      const now = new Date()
      const upcomingResults: Array<{
        ticker: string
        company: string
        date: string
        time: string
        epsEstimate: number | null
        revenueEstimate: number | null
        fiscalQuarter: string | null
      }> = []
      const recentResults: Array<{
        ticker: string
        company: string
        date: string
        epsActual: number | null
        epsEstimate: number | null
        epsSurprise: number | null
        epsSurprisePercent: number | null
        revenueActual: number | null
        beat: 'beat' | 'miss' | 'met' | 'pending'
      }> = []

      // Get upcoming earnings
      if (direction === 'upcoming' || direction === 'both') {
        const futureDate = new Date(now)
        futureDate.setDate(futureDate.getDate() + days)

        const tickerList = tickers?.map((t: string) => t.toUpperCase())
        const { data, error } = await supabase
          .from('company_earnings')
          .select('symbol, company_name, report_date, report_time, eps_estimate, revenue_estimate, fiscal_quarter, fiscal_year')
          .gte('report_date', now.toISOString().split('T')[0])
          .lte('report_date', futureDate.toISOString().split('T')[0])
          .order('report_date', { ascending: true })
          .limit(limit)

        if (!error && data) {
          const filtered = tickerList && tickerList.length > 0
            ? (data as UpcomingEarning[]).filter((e: UpcomingEarning) => tickerList.includes(e.symbol))
            : (data as UpcomingEarning[])

          filtered.forEach((e: UpcomingEarning) => {
            upcomingResults.push({
              ticker: e.symbol,
              company: e.company_name || e.symbol,
              date: e.report_date,
              time: e.report_time || 'TBD',
              epsEstimate: e.eps_estimate,
              revenueEstimate: e.revenue_estimate,
              fiscalQuarter: e.fiscal_quarter ? `Q${e.fiscal_quarter} ${e.fiscal_year}` : null
            })
          })
        }
      }

      // Get recent earnings
      if (direction === 'recent' || direction === 'both') {
        const pastDate = new Date(now)
        pastDate.setDate(pastDate.getDate() - days)

        const tickerList = tickers?.map((t: string) => t.toUpperCase())
        const { data, error } = await supabase
          .from('company_earnings')
          .select('symbol, company_name, report_date, eps_actual, eps_estimate, eps_surprise, eps_surprise_percent, revenue_actual')
          .lte('report_date', now.toISOString().split('T')[0])
          .gte('report_date', pastDate.toISOString().split('T')[0])
          .order('report_date', { ascending: false })
          .limit(limit)

        if (!error && data) {
          const filtered = tickerList && tickerList.length > 0
            ? (data as RecentEarning[]).filter((e: RecentEarning) => tickerList.includes(e.symbol))
            : (data as RecentEarning[])

          filtered.forEach((e: RecentEarning) => {
            let beat: 'beat' | 'miss' | 'met' | 'pending' = 'pending'
            if (e.eps_actual != null && e.eps_estimate != null) {
              if (e.eps_actual > e.eps_estimate) beat = 'beat'
              else if (e.eps_actual < e.eps_estimate) beat = 'miss'
              else beat = 'met'
            }
            recentResults.push({
              ticker: e.symbol,
              company: e.company_name || e.symbol,
              date: e.report_date,
              epsActual: e.eps_actual,
              epsEstimate: e.eps_estimate,
              epsSurprise: e.eps_surprise,
              epsSurprisePercent: e.eps_surprise_percent,
              revenueActual: e.revenue_actual,
              beat
            })
          })
        }
      }

      return {
        success: true,
        upcoming: upcomingResults,
        recent: recentResults,
        meta: {
          direction,
          days,
          asOf: now.toISOString()
        }
      }
    } catch {
      return { success: false, error: 'Failed to fetch earnings calendar' }
    }
  },
})
