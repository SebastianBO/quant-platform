/**
 * Firecrawl-based web scraping and research tools
 */

import { tool } from 'ai'
import { z } from 'zod'
import Firecrawl from '@mendable/firecrawl-js'

/**
 * Tool: Scrape Financial News/Research
 */
export const scrapeWebContentTool = tool({
  description: 'Scrape financial news articles, research reports, or company information from a URL.',
  inputSchema: z.object({
    url: z.string().url().describe('URL to scrape'),
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
 */
export const searchFinancialNewsTool = tool({
  description: 'Search the web for recent financial news about a stock, company, or market topic',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
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
 * Tool: Deep Research
 */
export const deepResearchTool = tool({
  description: 'Perform comprehensive autonomous deep research on any financial topic.',
  inputSchema: z.object({
    query: z.string().describe('Research query'),
    maxDepth: z.number().min(1).max(10).default(5).describe('Research depth'),
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
 */
export const extractFinancialDataTool = tool({
  description: 'Extract structured financial data from investor relations pages using AI.',
  inputSchema: z.object({
    urls: z.array(z.string()).min(1).max(5).describe('URLs to extract from'),
    prompt: z.string().describe('What data to extract'),
    dataType: z.enum(['earnings', 'guidance', 'metrics', 'custom']).default('custom').describe('Type of financial data'),
  }),
  execute: async ({ urls, prompt, dataType }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

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
 * Tool: Search Recent News
 */
export const searchRecentNewsTool = tool({
  description: 'Search for recent financial news with time filtering.',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    timeRange: z.enum(['day', 'week', 'month', 'year']).default('week').describe('How recent'),
    limit: z.number().min(1).max(10).default(5).describe('Number of results'),
    newsOnly: z.boolean().default(true).describe('Only return news articles'),
  }),
  execute: async ({ query, timeRange, limit, newsOnly }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

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
 */
export const firecrawlAgentTool = tool({
  description: 'Use an AI agent to autonomously search the web and find specific financial data.',
  inputSchema: z.object({
    prompt: z.string().describe('What data to find'),
    focusUrls: z.array(z.string()).optional().describe('Optional URLs to focus on'),
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
 */
export const crawlInvestorRelationsTool = tool({
  description: 'Crawl an entire investor relations website for comprehensive data.',
  inputSchema: z.object({
    url: z.string().url().describe('Investor relations page URL'),
    maxPages: z.number().min(1).max(20).default(10).describe('Maximum pages to crawl'),
  }),
  execute: async ({ url, maxPages }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY
      if (!apiKey) {
        return { success: false, error: 'Firecrawl API key not configured' }
      }

      const firecrawl = new Firecrawl({ apiKey })

      const crawlResult = await firecrawl.crawl(url, {
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }) as unknown as { success?: boolean; data?: Array<{ url: string; markdown?: string; metadata?: { title?: string } }> }

      if (crawlResult.success && crawlResult.data && crawlResult.data.length > 0) {
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
