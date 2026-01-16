import { describe, it, expect } from 'vitest'

/**
 * Tests for AI Tools modular structure
 * Verifies that the split files maintain the same exports
 */

describe('AI Tools Modular Structure', () => {
  describe('Utils exports', () => {
    it('exports all utility functions', async () => {
      const utils = await import('@/lib/ai/tools/utils')
      expect(utils.fetchWithRetry).toBeDefined()
      expect(utils.withTimeout).toBeDefined()
      expect(utils.createErrorResponse).toBeDefined()
      expect(utils.getSupabase).toBeDefined()
      expect(utils.getBaseUrl).toBeDefined()
      expect(utils.hasFinancialAPI).toBeDefined()
      expect(utils.DEFAULT_RETRY_OPTIONS).toBeDefined()
    })
  })

  describe('Core tools exports', () => {
    it('exports all core financial tools', async () => {
      const core = await import('@/lib/ai/tools/core')
      expect(core.getStockQuoteTool).toBeDefined()
      expect(core.getCompanyFundamentalsTool).toBeDefined()
      expect(core.getFinancialStatementsTool).toBeDefined()
      expect(core.getInsiderTradesTool).toBeDefined()
      expect(core.getInstitutionalOwnershipTool).toBeDefined()
      expect(core.getAnalystRatingsTool).toBeDefined()
      expect(core.getShortInterestTool).toBeDefined()
      expect(core.getBiotechCatalystsTool).toBeDefined()
      expect(core.searchStocksTool).toBeDefined()
      expect(core.getMarketMoversTool).toBeDefined()
      expect(core.compareStocksTool).toBeDefined()
    })
  })

  describe('Firecrawl tools exports', () => {
    it('exports all firecrawl tools', async () => {
      const firecrawl = await import('@/lib/ai/tools/firecrawl')
      expect(firecrawl.scrapeWebContentTool).toBeDefined()
      expect(firecrawl.searchFinancialNewsTool).toBeDefined()
      expect(firecrawl.deepResearchTool).toBeDefined()
      expect(firecrawl.extractFinancialDataTool).toBeDefined()
      expect(firecrawl.searchRecentNewsTool).toBeDefined()
      expect(firecrawl.firecrawlAgentTool).toBeDefined()
      expect(firecrawl.crawlInvestorRelationsTool).toBeDefined()
    })
  })

  describe('External API tools exports', () => {
    it('exports all external API tools', async () => {
      const externalApi = await import('@/lib/ai/tools/external-api')
      expect(externalApi.getSECFilingsTool).toBeDefined()
      expect(externalApi.getPriceHistoryTool).toBeDefined()
      expect(externalApi.getFinancialNewsTool).toBeDefined()
      expect(externalApi.getSegmentedRevenueTool).toBeDefined()
      expect(externalApi.getAnalystEstimatesTool).toBeDefined()
    })
  })

  describe('EU tools exports', () => {
    it('exports all European company tools', async () => {
      const eu = await import('@/lib/ai/tools/eu')
      expect(eu.searchEUCompaniesTool).toBeDefined()
      expect(eu.getEUCompanyDetailsTool).toBeDefined()
      expect(eu.getEUFinancialStatementsTool).toBeDefined()
      expect(eu.compareEUCompaniesTool).toBeDefined()
    })
  })

  describe('RAG tools exports', () => {
    it('exports all RAG tools', async () => {
      const rag = await import('@/lib/ai/tools/rag')
      expect(rag.searchFinancialDocumentsTool).toBeDefined()
      expect(rag.searchEarningsPatternsTool).toBeDefined()
      expect(rag.getSemanticContextTool).toBeDefined()
      expect(rag.getEarningsCalendarTool).toBeDefined()
    })
  })

  describe('Main index re-exports', () => {
    it('re-exports utilities from main index', async () => {
      const index = await import('@/lib/ai/tools/index')
      expect(index.fetchWithRetry).toBeDefined()
      expect(index.withTimeout).toBeDefined()
      expect(index.createErrorResponse).toBeDefined()
      expect(index.getSupabase).toBeDefined()
    })

    it('re-exports core tools from main index', async () => {
      const index = await import('@/lib/ai/tools/index')
      expect(index.getStockQuoteTool).toBeDefined()
      expect(index.getCompanyFundamentalsTool).toBeDefined()
      expect(index.searchStocksTool).toBeDefined()
    })

    it('re-exports all category tools from main index', async () => {
      const index = await import('@/lib/ai/tools/index')
      // Firecrawl
      expect(index.scrapeWebContentTool).toBeDefined()
      // External API
      expect(index.getSECFilingsTool).toBeDefined()
      // EU
      expect(index.searchEUCompaniesTool).toBeDefined()
      // RAG
      expect(index.searchFinancialDocumentsTool).toBeDefined()
    })
  })
})
