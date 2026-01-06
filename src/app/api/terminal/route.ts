import { streamText, convertToCoreMessages, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { scrapeTool, searchTool } from 'firecrawl-aisdk'
import { financialTools } from '@/lib/ai-tools'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are an elite AI Quant Analyst - a personal research assistant with access to live market data, SEC filings, options chains, and web research capabilities.

## Your Capabilities

**Market Data:**
- Real-time stock quotes and price data
- Technical indicators (RSI, MACD, moving averages, Bollinger Bands)
- Options chains with full Greeks
- Short interest and squeeze signals

**Fundamental Data:**
- Financial statements (income, balance sheet, cash flow)
- SEC filings (10-K, 10-Q, 8-K, insider Form 4)
- Earnings history, estimates, and surprises
- Insider trading activity

**Research:**
- Web search for news, analysis, and sentiment
- Web scraping for specific pages
- Biotech clinical trial catalysts
- Stock screening by multiple criteria

**Analysis:**
- Financial calculations (DCF, WACC, PEG ratio)
- Valuation comparisons
- Risk assessment

## Guidelines

1. **Always use tools first** - Never guess data. Fetch real numbers before answering.
2. **Be quantitative** - Use actual figures, ratios, percentages. Show your work.
3. **Multi-source analysis** - For stock analysis, pull fundamentals + technicals + insider activity + sentiment.
4. **Cite sources** - Reference where data came from (e.g., "Per the Q3 2024 10-Q...")
5. **Structured output** - Use headers, bullet points, and tables for clarity.
6. **Risk awareness** - Always highlight key risks alongside opportunities.
7. **Research depth** - For complex questions, do multi-step research using multiple tools.

## Response Format

For stock analysis, structure your response:
- **Summary**: One-line thesis
- **Key Metrics**: Table of important numbers
- **Analysis**: Bull/bear case with data
- **Risks**: Specific concerns
- **Conclusion**: Actionable insight

Remember: You're a research tool, not financial advice. Users should do their own due diligence.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Choose model - prefer Claude for better tool use
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    if (!hasAnthropic && !hasOpenAI) {
      return NextResponse.json(
        { error: 'No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 500 }
      )
    }

    const model = hasAnthropic
      ? anthropic('claude-sonnet-4-20250514')
      : openai('gpt-4o')

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: convertToCoreMessages(messages),
      tools: {
        // Financial data tools
        getStockQuote: financialTools.getStockQuote,
        getFinancials: financialTools.getFinancials,
        getSECFilings: financialTools.getSECFilings,
        getEarnings: financialTools.getEarnings,
        getInsiderTrades: financialTools.getInsiderTrades,
        getShortInterest: financialTools.getShortInterest,
        getOptionsChain: financialTools.getOptionsChain,
        getBiotechCatalysts: financialTools.getBiotechCatalysts,
        screenStocks: financialTools.screenStocks,
        getMarketOverview: financialTools.getMarketOverview,
        getTechnicalAnalysis: financialTools.getTechnicalAnalysis,
        calculate: financialTools.calculate,
        // Web research tools (Firecrawl)
        webSearch: searchTool,
        webScrape: scrapeTool,
      },
      stopWhen: stepCountIs(10), // Allow up to 10 steps for multi-tool reasoning
      toolChoice: 'auto', // Let model decide when to use tools
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Terminal API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    tools: [
      'getStockQuote', 'getFinancials', 'getSECFilings', 'getEarnings',
      'getInsiderTrades', 'getShortInterest', 'getOptionsChain', 'getBiotechCatalysts',
      'screenStocks', 'getMarketOverview', 'getTechnicalAnalysis', 'calculate',
      'webSearch', 'webScrape'
    ],
    model: process.env.ANTHROPIC_API_KEY ? 'claude-sonnet-4' : 'gpt-4o'
  })
}
