import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type {
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  InsiderTrade,
  AnalystEstimate,
  BusinessSegment
} from '@/types/financial'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

// Use OpenRouter if available, fallback to OpenAI
const getAIConfig = (): { url: string; key: string; model: string; headers: Record<string, string> } => {
  if (OPENROUTER_API_KEY) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: OPENROUTER_API_KEY,
      model: 'anthropic/claude-3.5-sonnet',
      headers: {
        'HTTP-Referer': 'https://lician.com',
        'X-Title': 'Lician AI Analysis'
      }
    }
  }
  return {
    url: 'https://api.openai.com/v1/chat/completions',
    key: OPENAI_API_KEY,
    model: 'gpt-4o',
    headers: {}
  }
}

interface AnalysisRequest {
  ticker: string
  analysisType: 'comprehensive' | 'red_flags' | 'questions' | 'competitive' | 'management' | 'valuation'
  data: {
    price?: number
    marketCap?: number
    pe?: number
    roic?: number
    revenueGrowth?: number
    grossMargin?: number
    operatingMargin?: number
    netMargin?: number
    debtToEquity?: number
    fcfYield?: number
    revenue?: number
    netIncome?: number
    freeCashFlow?: number
    totalDebt?: number
    cash?: number
    // Historical data
    incomeStatements?: IncomeStatement[]
    balanceSheets?: BalanceSheet[]
    cashFlows?: CashFlow[]
    // Trading data
    insiderTrades?: InsiderTrade[]
    analystEstimates?: AnalystEstimate[]
    // Segments
    segments?: BusinessSegment[]
    // Company info
    companyFacts?: Record<string, unknown>
  }
}

const ANALYSIS_PROMPTS: Record<string, (ticker: string, data: AnalysisRequest['data']) => string> = {
  comprehensive: (ticker, data) => `You are a senior equity analyst at Goldman Sachs. Provide a comprehensive institutional-grade investment thesis for ${ticker}.

FINANCIAL DATA:
- Stock Price: $${data.price?.toFixed(2) || 'N/A'}
- Market Cap: $${((data.marketCap || 0) / 1e9).toFixed(2)}B
- P/E Ratio: ${data.pe?.toFixed(1) || 'N/A'}
- ROIC: ${((data.roic || 0) * 100).toFixed(1)}%
- Revenue Growth: ${((data.revenueGrowth || 0) * 100).toFixed(1)}%
- Gross Margin: ${((data.grossMargin || 0) * 100).toFixed(1)}%
- Operating Margin: ${((data.operatingMargin || 0) * 100).toFixed(1)}%
- Net Margin: ${((data.netMargin || 0) * 100).toFixed(1)}%
- Debt/Equity: ${data.debtToEquity?.toFixed(2) || 'N/A'}
- FCF Yield: ${((data.fcfYield || 0) * 100).toFixed(1)}%
- TTM Revenue: $${((data.revenue || 0) / 1e9).toFixed(2)}B
- TTM Net Income: $${((data.netIncome || 0) / 1e9).toFixed(2)}B
- Free Cash Flow: $${((data.freeCashFlow || 0) / 1e9).toFixed(2)}B
- Total Debt: $${((data.totalDebt || 0) / 1e9).toFixed(2)}B
- Cash: $${((data.cash || 0) / 1e9).toFixed(2)}B

HISTORICAL INCOME (last 3 years):
${(data.incomeStatements || []).slice(0, 3).map((is) =>
  `${is.fiscal_period}: Revenue $${((is.revenue || 0) / 1e9).toFixed(1)}B, Net Income $${((is.net_income || 0) / 1e9).toFixed(1)}B, Operating Income $${((is.operating_income || 0) / 1e9).toFixed(1)}B`
).join('\n')}

INSIDER ACTIVITY (recent):
${(data.insiderTrades || []).slice(0, 5).map((t) =>
  `${t.transaction_date}: ${t.name} (${t.title}) ${(t.shares_traded || 0) > 0 ? 'BOUGHT' : 'SOLD'} ${Math.abs(t.shares_traded || 0).toLocaleString()} shares at $${t.price_per_share?.toFixed(2)}`
).join('\n') || 'No recent insider activity'}

ANALYST ESTIMATES:
${(data.analystEstimates || []).slice(0, 2).map((e) =>
  `${e.period}: EPS Est $${e.eps_avg?.toFixed(2)} (Low: $${e.eps_low?.toFixed(2)}, High: $${e.eps_high?.toFixed(2)})`
).join('\n') || 'No analyst estimates available'}

REVENUE SEGMENTS:
${(data.segments || []).map((s) => `${s.name}: $${((s.revenue || 0) / 1e9).toFixed(2)}B`).join('\n') || 'No segment data'}

Provide a structured analysis with:

## INVESTMENT THESIS
One paragraph summary of the core investment case.

## BULL CASE
3 specific reasons this stock could outperform (be quantitative).

## BEAR CASE
3 specific risks that could cause underperformance.

## VALUATION ASSESSMENT
Is the stock cheap, fairly valued, or expensive? Compare to growth rate and quality metrics.

## KEY METRICS TO WATCH
3 specific metrics investors should monitor going forward.

## RECOMMENDATION
BUY / HOLD / SELL with price target rationale.

Be direct, use actual numbers, avoid generic statements.`,

  red_flags: (ticker, data) => `You are a forensic accountant and short-seller analyst. Analyze ${ticker} for potential RED FLAGS and accounting concerns.

FINANCIAL DATA:
- Revenue: $${((data.revenue || 0) / 1e9).toFixed(2)}B
- Net Income: $${((data.netIncome || 0) / 1e9).toFixed(2)}B
- Free Cash Flow: $${((data.freeCashFlow || 0) / 1e9).toFixed(2)}B
- Gross Margin: ${((data.grossMargin || 0) * 100).toFixed(1)}%
- Operating Margin: ${((data.operatingMargin || 0) * 100).toFixed(1)}%
- Net Margin: ${((data.netMargin || 0) * 100).toFixed(1)}%
- Debt/Equity: ${data.debtToEquity?.toFixed(2) || 'N/A'}
- Total Debt: $${((data.totalDebt || 0) / 1e9).toFixed(2)}B
- Cash: $${((data.cash || 0) / 1e9).toFixed(2)}B

HISTORICAL TRENDS (3 years):
${(data.incomeStatements || []).slice(0, 3).map((is) =>
  `${is.fiscal_period}: Revenue $${((is.revenue || 0) / 1e9).toFixed(1)}B, Net Income $${((is.net_income || 0) / 1e9).toFixed(1)}B, Gross Profit $${((is.gross_profit || 0) / 1e9).toFixed(1)}B`
).join('\n')}

BALANCE SHEET TRENDS:
${(data.balanceSheets || []).slice(0, 3).map((bs) =>
  `${bs.fiscal_period}: Total Assets $${((bs.total_assets || 0) / 1e9).toFixed(1)}B, Total Liabilities $${((bs.total_liabilities || 0) / 1e9).toFixed(1)}B, Receivables $${((bs.accounts_receivable || 0) / 1e9).toFixed(1)}B, Inventory $${((bs.inventory || 0) / 1e9).toFixed(1)}B`
).join('\n')}

CASH FLOW TRENDS:
${(data.cashFlows || []).slice(0, 3).map((cf) =>
  `${cf.fiscal_period}: Operating CF $${((cf.operating_cash_flow || 0) / 1e9).toFixed(1)}B, CapEx $${((cf.capital_expenditure || 0) / 1e9).toFixed(1)}B, FCF $${((cf.free_cash_flow || 0) / 1e9).toFixed(1)}B`
).join('\n')}

INSIDER TRADING:
${(data.insiderTrades || []).slice(0, 10).map((t) =>
  `${t.transaction_date}: ${t.name} ${(t.shares_traded || 0) > 0 ? 'BUY' : 'SELL'} ${Math.abs(t.shares_traded || 0).toLocaleString()} shares`
).join('\n') || 'No data'}

Analyze for these specific RED FLAGS:

## EARNINGS QUALITY
- Is FCF significantly lower than Net Income? (sign of aggressive accounting)
- Are receivables growing faster than revenue? (channel stuffing)
- Is inventory growing faster than sales? (demand issues)

## BALANCE SHEET CONCERNS
- Is debt increasing while cash decreases?
- Are intangible assets a large % of total assets?
- Any signs of financial distress?

## INSIDER BEHAVIOR
- Pattern of insider selling?
- Any unusual transactions?

## MARGIN TRENDS
- Are margins declining?
- Is the business model deteriorating?

## POTENTIAL RED FLAGS FOUND
List specific concerns with supporting numbers.

## RISK RATING
LOW / MEDIUM / HIGH accounting/fraud risk with explanation.

Be specific. If no red flags found, say so clearly.`,

  questions: (ticker, data) => `You are a buy-side analyst preparing for a management meeting with ${ticker}. Based on the data below, identify WHAT'S MISSING and what questions a sophisticated investor should ask.

AVAILABLE DATA:
- Market Cap: $${((data.marketCap || 0) / 1e9).toFixed(2)}B
- P/E: ${data.pe?.toFixed(1) || 'N/A'}
- ROIC: ${((data.roic || 0) * 100).toFixed(1)}%
- Revenue Growth: ${((data.revenueGrowth || 0) * 100).toFixed(1)}%
- Margins: Gross ${((data.grossMargin || 0) * 100).toFixed(1)}%, Operating ${((data.operatingMargin || 0) * 100).toFixed(1)}%, Net ${((data.netMargin || 0) * 100).toFixed(1)}%
- FCF Yield: ${((data.fcfYield || 0) * 100).toFixed(1)}%
- Debt/Equity: ${data.debtToEquity?.toFixed(2) || 'N/A'}

SEGMENT REVENUE:
${(data.segments || []).map((s) => `${s.name}: $${((s.revenue || 0) / 1e9).toFixed(2)}B`).join('\n') || 'Limited segment data'}

Generate:

## INFORMATION GAPS
What important data do we NOT have from the APIs that would be critical for investment decision?

## QUALITATIVE QUESTIONS
5 questions about competitive position, moat, and strategy that numbers can't answer:

## MANAGEMENT QUESTIONS
5 questions to ask the CEO/CFO about capital allocation, guidance, and execution:

## INDUSTRY QUESTIONS
3 questions about industry dynamics, competition, and market share:

## RISK QUESTIONS
3 questions about specific risks that aren't obvious from financials:

## DEEP DIVE AREAS
What areas require more research before investing?`,

  competitive: (ticker, data) => `You are a strategy consultant analyzing ${ticker}'s competitive position.

COMPANY DATA:
- Market Cap: $${((data.marketCap || 0) / 1e9).toFixed(2)}B
- Revenue: $${((data.revenue || 0) / 1e9).toFixed(2)}B
- Gross Margin: ${((data.grossMargin || 0) * 100).toFixed(1)}%
- Operating Margin: ${((data.operatingMargin || 0) * 100).toFixed(1)}%
- Revenue Growth: ${((data.revenueGrowth || 0) * 100).toFixed(1)}%
- ROIC: ${((data.roic || 0) * 100).toFixed(1)}%

REVENUE SEGMENTS:
${(data.segments || []).map((s) => `${s.name}: $${((s.revenue || 0) / 1e9).toFixed(2)}B`).join('\n') || 'Limited data'}

Based on your knowledge of this company and its industry, analyze:

## COMPETITIVE MOAT
What is ${ticker}'s competitive advantage? Rate the moat: WIDE / NARROW / NONE

## PORTER'S FIVE FORCES
Brief assessment of each force for this company's industry.

## KEY COMPETITORS
Who are the main competitors and how does ${ticker} compare?

## MARKET POSITION
Is ${ticker} gaining or losing market share? Why?

## DISRUPTION RISKS
What technologies or business models could disrupt this company?

## MOAT SUSTAINABILITY
How durable is the competitive advantage? What could erode it?`,

  management: (ticker, data) => `You are evaluating ${ticker}'s management quality and capital allocation.

FINANCIAL CONTEXT:
- Market Cap: $${((data.marketCap || 0) / 1e9).toFixed(2)}B
- ROIC: ${((data.roic || 0) * 100).toFixed(1)}%
- Revenue Growth: ${((data.revenueGrowth || 0) * 100).toFixed(1)}%
- FCF: $${((data.freeCashFlow || 0) / 1e9).toFixed(2)}B
- Debt/Equity: ${data.debtToEquity?.toFixed(2) || 'N/A'}

INSIDER ACTIVITY:
${(data.insiderTrades || []).slice(0, 10).map((t) =>
  `${t.transaction_date}: ${t.name} (${t.title}) ${(t.shares_traded || 0) > 0 ? 'BOUGHT' : 'SOLD'} ${Math.abs(t.shares_traded || 0).toLocaleString()} shares at $${t.price_per_share?.toFixed(2) || 'N/A'}`
).join('\n') || 'No recent insider activity'}

CASH FLOW ALLOCATION:
${(data.cashFlows || []).slice(0, 3).map((cf) =>
  `${cf.fiscal_period}: Operating CF $${((cf.operating_cash_flow || 0) / 1e9).toFixed(1)}B, CapEx $${((cf.capital_expenditure || 0) / 1e9).toFixed(1)}B, Dividends $${((cf.dividends_paid || 0) / 1e9).toFixed(1)}B, Buybacks $${((cf.share_repurchases || 0) / 1e9).toFixed(1)}B`
).join('\n')}

Based on your knowledge of this company's management, analyze:

## MANAGEMENT QUALITY ASSESSMENT
Rate overall management: EXCELLENT / GOOD / AVERAGE / POOR

## CAPITAL ALLOCATION TRACK RECORD
How has management allocated capital? Have acquisitions created value?

## INSIDER ALIGNMENT
Do insider trading patterns suggest confidence? Is management buying or selling?

## COMPENSATION STRUCTURE
Is executive comp aligned with shareholders? Any concerns?

## GOVERNANCE ISSUES
Any red flags around board independence, related party transactions, etc.?

## MANAGEMENT SCORE
1-10 rating with key factors.`,

  valuation: (ticker, data) => `You are a valuation specialist. Provide a detailed valuation analysis for ${ticker}.

CURRENT METRICS:
- Stock Price: $${data.price?.toFixed(2) || 'N/A'}
- Market Cap: $${((data.marketCap || 0) / 1e9).toFixed(2)}B
- P/E Ratio: ${data.pe?.toFixed(1) || 'N/A'}
- FCF Yield: ${((data.fcfYield || 0) * 100).toFixed(1)}%
- Revenue: $${((data.revenue || 0) / 1e9).toFixed(2)}B
- Net Income: $${((data.netIncome || 0) / 1e9).toFixed(2)}B
- Free Cash Flow: $${((data.freeCashFlow || 0) / 1e9).toFixed(2)}B
- Revenue Growth: ${((data.revenueGrowth || 0) * 100).toFixed(1)}%
- ROIC: ${((data.roic || 0) * 100).toFixed(1)}%
- Gross Margin: ${((data.grossMargin || 0) * 100).toFixed(1)}%
- Net Margin: ${((data.netMargin || 0) * 100).toFixed(1)}%

Provide:

## VALUATION SUMMARY
Is ${ticker} UNDERVALUED, FAIRLY VALUED, or OVERVALUED?

## COMPARABLE ANALYSIS
What multiples should this company trade at vs peers? Why?

## GROWTH VS VALUE ASSESSMENT
Is the growth priced in appropriately? PEG-style analysis.

## SUM-OF-PARTS CONSIDERATION
If applicable, what would segments be worth separately?

## HISTORICAL VALUATION CONTEXT
How does current valuation compare to historical ranges?

## FAIR VALUE ESTIMATE
Your estimate of fair value per share with methodology.

## MARGIN OF SAFETY
What price would provide adequate margin of safety?`
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication to prevent API abuse
    const { user, error: authError } = await requireAuth(request)
    if (authError) {
      return authError
    }

    // Require premium for AI analysis features
    if (!user.isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required for AI analysis', upgrade_url: '/premium' },
        { status: 403 }
      )
    }

    const body: AnalysisRequest = await request.json()
    const { ticker, analysisType = 'comprehensive', data } = body

    const config = getAIConfig()

    if (!config.key) {
      return NextResponse.json({
        summary: `No API key configured. Please add OPENROUTER_API_KEY or OPENAI_API_KEY to environment variables.`,
        analysisType
      })
    }

    const promptGenerator = ANALYSIS_PROMPTS[analysisType]
    if (!promptGenerator) {
      return NextResponse.json({
        summary: `Unknown analysis type: ${analysisType}`,
        analysisType
      }, { status: 400 })
    }

    const prompt = promptGenerator(ticker, data)

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
        ...config.headers
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior equity analyst at a top investment bank. Provide institutional-grade analysis that is specific, quantitative, and actionable. Use markdown formatting with headers (##) for sections. Be direct and avoid generic statements. Always reference the actual numbers provided.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('AI API error', { error })
      throw new Error('AI API request failed')
    }

    const responseData = await response.json()
    const summary = responseData.choices?.[0]?.message?.content || 'Unable to generate analysis.'

    return NextResponse.json({
      summary,
      analysisType,
      model: config.model
    })
  } catch (error) {
    logger.error('AI Summary error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      summary: 'Error generating AI analysis. Please check API configuration and try again.',
      analysisType: 'error'
    }, { status: 500 })
  }
}
