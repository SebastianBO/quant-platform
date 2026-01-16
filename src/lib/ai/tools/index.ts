/**
 * AI Financial Tools - Consolidated Exports
 *
 * Split into categories for maintainability:
 * - core.ts: Stock quotes, fundamentals, statements, insider, institutional, analyst, short interest
 * - firecrawl.ts: Web scraping and research tools
 * - external-api.ts: Financial Datasets API tools (SEC, prices, news, segments)
 * - eu.ts: European company tools
 * - rag.ts: RAG/semantic search tools
 * - utils.ts: Shared utilities (retry, timeout, Supabase client)
 */

// Re-export utilities
export {
  fetchWithRetry,
  withTimeout,
  createErrorResponse,
  getSupabase,
  getBaseUrl,
  hasFinancialAPI,
  type RetryOptions,
  DEFAULT_RETRY_OPTIONS,
} from './utils'

// Core financial data tools
export {
  getStockQuoteTool,
  getCompanyFundamentalsTool,
  getFinancialStatementsTool,
  getInsiderTradesTool,
  getInstitutionalOwnershipTool,
  getAnalystRatingsTool,
  getShortInterestTool,
  getBiotechCatalystsTool,
  searchStocksTool,
  getMarketMoversTool,
  compareStocksTool,
} from './core'

// Firecrawl-based tools
export {
  scrapeWebContentTool,
  searchFinancialNewsTool,
  deepResearchTool,
  extractFinancialDataTool,
  searchRecentNewsTool,
  firecrawlAgentTool,
  crawlInvestorRelationsTool,
} from './firecrawl'

// External API tools
export {
  getSECFilingsTool,
  getPriceHistoryTool,
  getFinancialNewsTool,
  getSegmentedRevenueTool,
  getAnalystEstimatesTool,
} from './external-api'

// European company tools
export {
  searchEUCompaniesTool,
  getEUCompanyDetailsTool,
  getEUFinancialStatementsTool,
  compareEUCompaniesTool,
} from './eu'

// RAG tools
export {
  searchFinancialDocumentsTool,
  searchEarningsPatternsTool,
  getSemanticContextTool,
  getEarningsCalendarTool,
} from './rag'

/**
 * All tools exported as an object for use in the chat API
 */
export const financialTools = {
  // Core financial data from Supabase
  getStockQuote: (await import('./core')).getStockQuoteTool,
  getCompanyFundamentals: (await import('./core')).getCompanyFundamentalsTool,
  getFinancialStatements: (await import('./core')).getFinancialStatementsTool,
  getInsiderTrades: (await import('./core')).getInsiderTradesTool,
  getInstitutionalOwnership: (await import('./core')).getInstitutionalOwnershipTool,
  getAnalystRatings: (await import('./core')).getAnalystRatingsTool,
  getShortInterest: (await import('./core')).getShortInterestTool,
  getBiotechCatalysts: (await import('./core')).getBiotechCatalystsTool,
  getEarningsCalendar: (await import('./rag')).getEarningsCalendarTool,
  searchStocks: (await import('./core')).searchStocksTool,
  getMarketMovers: (await import('./core')).getMarketMoversTool,
  compareStocks: (await import('./core')).compareStocksTool,

  // Basic Firecrawl tools
  scrapeWebContent: (await import('./firecrawl')).scrapeWebContentTool,
  searchFinancialNews: (await import('./firecrawl')).searchFinancialNewsTool,

  // Financial Datasets API tools
  getSECFilings: (await import('./external-api')).getSECFilingsTool,
  getPriceHistory: (await import('./external-api')).getPriceHistoryTool,
  getFinancialNews: (await import('./external-api')).getFinancialNewsTool,
  getSegmentedRevenue: (await import('./external-api')).getSegmentedRevenueTool,
  getAnalystEstimates: (await import('./external-api')).getAnalystEstimatesTool,

  // Advanced Firecrawl tools
  deepResearch: (await import('./firecrawl')).deepResearchTool,
  extractFinancialData: (await import('./firecrawl')).extractFinancialDataTool,
  searchRecentNews: (await import('./firecrawl')).searchRecentNewsTool,
  firecrawlAgent: (await import('./firecrawl')).firecrawlAgentTool,
  crawlInvestorRelations: (await import('./firecrawl')).crawlInvestorRelationsTool,

  // European company tools
  searchEUCompanies: (await import('./eu')).searchEUCompaniesTool,
  getEUCompanyDetails: (await import('./eu')).getEUCompanyDetailsTool,
  getEUFinancialStatements: (await import('./eu')).getEUFinancialStatementsTool,
  compareEUCompanies: (await import('./eu')).compareEUCompaniesTool,

  // RAG (Retrieval-Augmented Generation) tools
  searchFinancialDocuments: (await import('./rag')).searchFinancialDocumentsTool,
  searchEarningsPatterns: (await import('./rag')).searchEarningsPatternsTool,
  getSemanticContext: (await import('./rag')).getSemanticContextTool,
}
