import { streamText, createGateway } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { financialTools } from '@/lib/ai/tools'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

// Simple in-memory rate limiting (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // 10 requests per window
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

// Lazy-load Supabase client
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

// Vercel AI Gateway - 100x cheaper than Claude!
// Llama 3.3-70B: $0.03/M input, $0.05/M output
// Uses free $5/month Vercel credits
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
})

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

// RAG: Fetch relevant context from Supabase based on query
async function fetchRelevantContext(query: string): Promise<string> {
  try {
    const supabase = getSupabase()

    // Extract potential ticker from query
    const tickerMatch = query.match(/\b([A-Z]{1,5})\b/g)
    const potentialTickers = tickerMatch?.slice(0, 3) || []

    let context = ''

    if (potentialTickers.length > 0) {
      // Fetch company fundamentals for mentioned tickers
      const { data: fundamentals } = await supabase
        .from('company_fundamentals')
        .select('ticker, company_name, sector, industry, market_cap, pe_ratio, eps, revenue, description')
        .in('ticker', potentialTickers)
        .limit(3)

      if (fundamentals && fundamentals.length > 0) {
        context += '\n\n## Relevant Company Data:\n'
        type Fundamental = Record<string, unknown>
        for (const f of fundamentals as Fundamental[]) {
          context += `\n### ${f.company_name} (${f.ticker})\n`
          context += `- Sector: ${f.sector || 'N/A'} | Industry: ${f.industry || 'N/A'}\n`
          context += `- Market Cap: $${f.market_cap ? ((f.market_cap as number) / 1e9).toFixed(2) + 'B' : 'N/A'}\n`
          context += `- P/E Ratio: ${(f.pe_ratio as number)?.toFixed(2) || 'N/A'} | EPS: $${(f.eps as number)?.toFixed(2) || 'N/A'}\n`
          if (f.description) {
            context += `- Description: ${(f.description as string).substring(0, 200)}...\n`
          }
        }
      }

      // Fetch recent financial metrics
      const { data: metrics } = await supabase
        .from('financial_metrics')
        .select('ticker, report_period, pe_ratio, pb_ratio, ps_ratio, gross_margin, operating_margin, net_margin, return_on_equity, debt_to_equity')
        .in('ticker', potentialTickers)
        .order('report_period', { ascending: false })
        .limit(3)

      if (metrics && metrics.length > 0) {
        context += '\n\n## Latest Financial Metrics:\n'
        type Metric = Record<string, unknown>
        for (const m of metrics as Metric[]) {
          context += `\n### ${m.ticker} (${m.report_period})\n`
          context += `- P/E: ${(m.pe_ratio as number)?.toFixed(2) || 'N/A'} | P/B: ${(m.pb_ratio as number)?.toFixed(2) || 'N/A'} | P/S: ${(m.ps_ratio as number)?.toFixed(2) || 'N/A'}\n`
          context += `- Gross Margin: ${m.gross_margin ? ((m.gross_margin as number) * 100).toFixed(1) + '%' : 'N/A'}\n`
          context += `- Operating Margin: ${m.operating_margin ? ((m.operating_margin as number) * 100).toFixed(1) + '%' : 'N/A'}\n`
          context += `- ROE: ${m.return_on_equity ? ((m.return_on_equity as number) * 100).toFixed(1) + '%' : 'N/A'}\n`
          context += `- Debt/Equity: ${(m.debt_to_equity as number)?.toFixed(2) || 'N/A'}\n`
        }
      }
    }

    return context
  } catch (error) {
    console.error('RAG context fetch error:', error)
    return ''
  }
}

const SYSTEM_PROMPT = `You are Lician AI, an expert financial analyst assistant on lician.com - a comprehensive stock analysis platform.

## Your Capabilities
You have access to powerful tools to fetch real financial data:

1. **Stock Quotes**: Get real-time prices, volume, and market cap
2. **Company Fundamentals**: PE ratio, margins, growth rates, debt ratios
3. **Financial Statements**: Income statements, balance sheets, cash flows
4. **Insider Trading**: Track executive buys and sells
5. **Institutional Ownership**: 13F holdings from hedge funds and institutions
6. **Analyst Ratings**: Consensus estimates and price targets
7. **Short Interest**: Short volume and short interest data
8. **Biotech Catalysts**: FDA dates, clinical trial results
9. **Stock Search**: Find companies by name or ticker
10. **Market Movers**: Top gainers, losers, most active
11. **Stock Comparison**: Compare metrics between stocks
12. **Web Search/Scraping**: Get latest news and research

## How to Respond
1. **ALWAYS use tools first** to get real data before answering questions about stocks
2. **Be specific** - cite actual numbers from the data
3. **Be concise** - 2-3 paragraphs for most responses
4. **Be balanced** - present both bull and bear cases
5. **Disclaim** - remind users this is not financial advice

## Example Interactions
- "What's Apple's PE ratio?" → Use getCompanyFundamentals tool, then explain
- "Show me insider buying" → Use getInsiderTrades tool, summarize activity
- "Compare NVDA vs AMD" → Use compareStocks tool, analyze differences
- "Latest news on Tesla" → Use searchFinancialNews tool, summarize findings

## About Lician
- Free real-time stock quotes and analysis
- AI-powered research tools
- Portfolio tracking at /portfolio
- Stock screener at /screener
- Biotech catalysts at /biotech

Always provide actionable insights and suggest relevant Lician features when appropriate.`

export async function POST(req: NextRequest) {
  // Rate limiting for public endpoint
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Sign up for unlimited AI access!',
        upgrade_url: '/premium'
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + RATE_WINDOW)
        }
      }
    )
  }

  try {
    const { messages } = await req.json()

    // Get the latest user message for RAG context
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const userQuery = lastUserMessage?.content || ''

    // Fetch relevant context from Supabase (RAG)
    const ragContext = await fetchRelevantContext(userQuery)

    // Enhance system prompt with RAG context
    const enhancedSystemPrompt = ragContext
      ? `${SYSTEM_PROMPT}\n\n## Pre-loaded Context from Database:${ragContext}\n\nUse this context along with your tools to provide accurate answers.`
      : SYSTEM_PROMPT

    // Use Llama 3.3-70B via Vercel AI Gateway - 100x cheaper!
    // $0.03/M input, $0.05/M output vs Claude's $3/M input, $15/M output
    const result = streamText({
      model: gateway('meta/llama-3.3-70b'),
      system: enhancedSystemPrompt,
      messages,
      tools: financialTools,
      toolChoice: 'auto',
    })

    return result.toTextStreamResponse({
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      }
    })
  } catch (error) {
    console.error('Public chat error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
